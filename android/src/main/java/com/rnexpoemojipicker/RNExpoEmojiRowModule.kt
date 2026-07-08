package com.rnexpoemojipicker

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.text.TextPaint
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.views.ExpoView

/**
 * One View per picker row: draws every glyph straight onto the canvas
 * instead of mounting a Text view per emoji. Touch handling stays on the
 * JS side (the row's Pressable), so this view is purely visual.
 */
class EmojiRowView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val paint = TextPaint(Paint.ANTI_ALIAS_FLAG)

  var glyphs: List<String> = emptyList()
    set(value) {
      field = value
      invalidate()
    }

  var columns: Int = 8
    set(value) {
      field = value
      invalidate()
    }

  init {
    setWillNotDraw(false)
    setFontSize(28f)
  }

  fun setFontSize(dp: Float) {
    // The JS rows render with allowFontScaling={false}, so dp (density,
    // not scaledDensity) keeps native and JS glyphs the same size.
    paint.textSize = dp * resources.displayMetrics.density
    invalidate()
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    if (columns <= 0 || glyphs.isEmpty() || width == 0) return
    val slot = width.toFloat() / columns
    // Match the JS rows: RN reverses flex rows under RTL, and the JS hit
    // test flips the column index, so the drawing must flip too.
    val rtl = layoutDirection == LAYOUT_DIRECTION_RTL
    val baseline = height / 2f - (paint.descent() + paint.ascent()) / 2f
    for ((index, glyph) in glyphs.withIndex()) {
      val column = if (rtl) columns - 1 - index else index
      val glyphWidth = paint.measureText(glyph)
      canvas.drawText(glyph, column * slot + (slot - glyphWidth) / 2f, baseline, paint)
    }
  }
}

class RNExpoEmojiRowModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("RNExpoEmojiRow")

    View(EmojiRowView::class) {
      Prop("glyphs") { view: EmojiRowView, glyphs: List<String> ->
        view.glyphs = glyphs
      }
      Prop("fontSize") { view: EmojiRowView, size: Float ->
        view.setFontSize(size)
      }
      Prop("columns") { view: EmojiRowView, columns: Int ->
        view.columns = columns
      }
    }
  }
}
