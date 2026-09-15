package com.lomolanisgo.smartisanicons;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.LruCache;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.inputmethod.EditorInfo;
import android.widget.AbsListView;
import android.widget.BaseAdapter;
import android.widget.EditText;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Launcher entry of the icon pack: browse every icon in the pack.
 * The list comes from assets/gallery.json, written by scripts/generate.mjs.
 */
public class GalleryActivity extends Activity {

    private static final int BG = Color.rgb(20, 22, 28);
    private static final int PANEL = Color.rgb(32, 35, 43);
    private static final int INK = Color.rgb(231, 232, 235);
    private static final int MUTED = Color.rgb(154, 160, 171);
    private static final int ACCENT = Color.rgb(124, 155, 255);

    static final class Icon {
        final String drawable, pkg, name;
        final boolean custom, alt;
        final int resId;
        Icon(String drawable, String pkg, String name, boolean custom, boolean alt, int resId) {
            this.drawable = drawable; this.pkg = pkg; this.name = name;
            this.custom = custom; this.alt = alt; this.resId = resId;
        }
    }

    private final List<Icon> all = new ArrayList<>();
    private final List<Icon> shown = new ArrayList<>();
    private boolean customOnly = true;
    private String query = "";

    private final ExecutorService pool = Executors.newFixedThreadPool(3);
    private final Handler main = new Handler(Looper.getMainLooper());
    private LruCache<Integer, Bitmap> cache;
    private int cellPx;

    private TextView count, tabCustom, tabAll;
    private BaseAdapter adapter;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);

        int cacheKb = (int) (Runtime.getRuntime().maxMemory() / 1024 / 6);
        cache = new LruCache<Integer, Bitmap>(cacheKb) {
            @Override protected int sizeOf(Integer k, Bitmap b) { return b.getByteCount() / 1024; }
        };
        cellPx = dp(64);

        loadIcons();

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);
        root.setFitsSystemWindows(true);

        // header
        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.VERTICAL);
        header.setPadding(dp(20), dp(20), dp(20), dp(8));
        TextView title = text(getString(R_string("app_name")), 26, INK, true);
        count = text("", 13, MUTED, false);
        header.addView(title);
        header.addView(count);

        // tabs
        LinearLayout tabs = new LinearLayout(this);
        tabs.setPadding(0, dp(14), 0, 0);
        tabCustom = tab("我的定制");
        tabAll = tab("全部");
        tabCustom.setOnClickListener(v -> { customOnly = true; refresh(); });
        tabAll.setOnClickListener(v -> { customOnly = false; refresh(); });
        tabs.addView(tabCustom);
        LinearLayout.LayoutParams gap = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        gap.leftMargin = dp(8);
        tabs.addView(tabAll, gap);
        header.addView(tabs);

        // search
        EditText search = new EditText(this);
        search.setHint("搜索应用名或包名");
        search.setHintTextColor(MUTED);
        search.setTextColor(INK);
        search.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        search.setSingleLine(true);
        search.setImeOptions(EditorInfo.IME_ACTION_SEARCH);
        search.setPadding(dp(14), dp(10), dp(14), dp(10));
        search.setBackground(rounded(PANEL, dp(10)));
        LinearLayout.LayoutParams sp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        sp.topMargin = dp(12);
        header.addView(search, sp);
        search.addTextChangedListener(new TextWatcher() {
            public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            public void onTextChanged(CharSequence s, int a, int b, int c) {}
            public void afterTextChanged(Editable s) { query = s.toString().trim().toLowerCase(Locale.ROOT); refresh(); }
        });
        root.addView(header);

        // grid
        GridView grid = new GridView(this);
        grid.setColumnWidth(dp(84));
        grid.setNumColumns(GridView.AUTO_FIT);
        grid.setStretchMode(GridView.STRETCH_COLUMN_WIDTH);
        grid.setVerticalSpacing(dp(10));
        grid.setPadding(dp(12), dp(8), dp(12), dp(24));
        grid.setClipToPadding(false);
        grid.setSelector(new ColorDrawable(Color.TRANSPARENT));
        adapter = new BaseAdapter() {
            public int getCount() { return shown.size(); }
            public Object getItem(int i) { return shown.get(i); }
            public long getItemId(int i) { return i; }
            public View getView(int i, View v, ViewGroup parent) { return cell(shown.get(i), v); }
        };
        grid.setAdapter(adapter);
        grid.setOnItemClickListener((p, v, i, id) -> showDetail(shown.get(i)));
        root.addView(grid, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        setContentView(root);
        refresh();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        pool.shutdownNow();
    }

    private int R_string(String name) {
        return getResources().getIdentifier(name, "string", getPackageName());
    }

    private void loadIcons() {
        try (InputStream in = getAssets().open("gallery.json")) {
            ByteArrayOutputStream buf = new ByteArrayOutputStream();
            byte[] b = new byte[16384];
            for (int n; (n = in.read(b)) > 0; ) buf.write(b, 0, n);
            JSONArray arr = new JSONArray(buf.toString("UTF-8"));
            String pkg = getPackageName();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                String d = o.getString("d");
                int id = getResources().getIdentifier(d, "drawable", pkg);
                if (id == 0) continue;
                all.add(new Icon(d, o.optString("p"), o.optString("n", o.optString("p")),
                        o.optBoolean("c"), o.optBoolean("a"), id));
            }
        } catch (Exception e) {
            android.util.Log.e("SmartisanIcons", "gallery.json", e);
        }
    }

    private void refresh() {
        shown.clear();
        int custom = 0;
        for (Icon ic : all) {
            if (ic.custom) custom++;
            if (customOnly && !ic.custom) continue;
            if (!query.isEmpty() && !ic.name.toLowerCase(Locale.ROOT).contains(query)
                    && !ic.pkg.toLowerCase(Locale.ROOT).contains(query)) continue;
            shown.add(ic);
        }
        count.setText(String.format(Locale.ROOT, "共 %d 个图标 · 我的定制 %d 个 · 当前显示 %d 个", all.size(), custom, shown.size()));
        styleTab(tabCustom, customOnly);
        styleTab(tabAll, !customOnly);
        adapter.notifyDataSetChanged();
    }

    private View cell(Icon ic, View convert) {
        LinearLayout box;
        ImageView img;
        TextView label;
        if (convert instanceof LinearLayout) {
            box = (LinearLayout) convert;
            img = (ImageView) box.getChildAt(0);
            label = (TextView) box.getChildAt(1);
        } else {
            box = new LinearLayout(this);
            box.setOrientation(LinearLayout.VERTICAL);
            box.setGravity(Gravity.CENTER_HORIZONTAL);
            box.setLayoutParams(new AbsListView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
            img = new ImageView(this);
            img.setScaleType(ImageView.ScaleType.FIT_CENTER);
            box.addView(img, new LinearLayout.LayoutParams(cellPx, cellPx));
            label = text("", 11, MUTED, false);
            label.setGravity(Gravity.CENTER);
            label.setMaxLines(2);
            label.setPadding(dp(2), dp(4), dp(2), 0);
            box.addView(label, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        }
        label.setText(ic.alt ? ic.name + "（备选）" : ic.name);
        bind(img, ic.resId, cellPx);
        return box;
    }

    /** Decode off the main thread, downsampled to the target size, with a memory cache. */
    private void bind(ImageView img, int resId, int px) {
        img.setTag(resId);
        Bitmap hit = cache.get(resId);
        if (hit != null) { img.setImageBitmap(hit); return; }
        img.setImageDrawable(null);
        pool.execute(() -> {
            Bitmap bmp = decode(resId, px);
            if (bmp == null) return;
            cache.put(resId, bmp);
            main.post(() -> { if (Integer.valueOf(resId).equals(img.getTag())) img.setImageBitmap(bmp); });
        });
    }

    private Bitmap decode(int resId, int px) {
        BitmapFactory.Options o = new BitmapFactory.Options();
        o.inJustDecodeBounds = true;
        BitmapFactory.decodeResource(getResources(), resId, o);
        int s = 1;
        while (o.outWidth / (s * 2) >= px) s *= 2;
        o = new BitmapFactory.Options();
        o.inSampleSize = s;
        return BitmapFactory.decodeResource(getResources(), resId, o);
    }

    private void showDetail(Icon ic) {
        Dialog d = new Dialog(this);
        d.requestWindowFeature(Window.FEATURE_NO_TITLE);
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER_HORIZONTAL);
        box.setPadding(dp(28), dp(28), dp(28), dp(24));
        box.setBackground(rounded(PANEL, dp(18)));
        ImageView big = new ImageView(this);
        big.setImageBitmap(BitmapFactory.decodeResource(getResources(), ic.resId));
        box.addView(big, new LinearLayout.LayoutParams(dp(192), dp(192)));
        TextView name = text(ic.alt ? ic.name + "（备选）" : ic.name, 18, INK, true);
        name.setGravity(Gravity.CENTER);
        name.setPadding(0, dp(16), 0, dp(2));
        box.addView(name);
        TextView pkg = text(ic.pkg, 12, MUTED, false);
        pkg.setGravity(Gravity.CENTER);
        box.addView(pkg);
        TextView tag = text(ic.custom ? "我的定制" : "锤子原版", 12, ic.custom ? ACCENT : MUTED, true);
        tag.setPadding(0, dp(10), 0, 0);
        box.addView(tag);
        box.setOnClickListener(v -> d.dismiss());
        d.setContentView(box);
        if (d.getWindow() != null) d.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        d.show();
    }

    private TextView tab(String label) {
        TextView t = text(label, 14, INK, true);
        t.setPadding(dp(16), dp(7), dp(16), dp(7));
        return t;
    }

    private void styleTab(TextView t, boolean on) {
        t.setTextColor(on ? BG : INK);
        t.setBackground(rounded(on ? INK : PANEL, dp(16)));
    }

    private TextView text(String s, int sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private GradientDrawable rounded(int color, int radius) {
        GradientDrawable g = new GradientDrawable();
        g.setColor(color);
        g.setCornerRadius(radius);
        return g;
    }

    private int dp(int v) {
        return Math.round(TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics()));
    }
}
