package se.basit.mostercall

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.net.Uri
import android.view.View
import kotlin.math.max
import kotlin.math.min

// Round contact photo, or the mockup's coloured silhouette when there is none.
class PortraitView(
  context: Context,
  photoUri: String?,
  private val background: Int,
  private val figure: Int,
  private val border: Int,
  private val borderWidth: Float,
) : View(context) {
  private val photo: Bitmap? = photoUri?.let { decode(it) }
  private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
  private val clip = Path()

  override fun onDraw(canvas: Canvas) {
    val size = min(width, height).toFloat()
    val cx = width / 2f
    val cy = height / 2f
    val radius = size / 2f

    canvas.save()
    clip.reset()
    clip.addCircle(cx, cy, radius, Path.Direction.CW)
    canvas.clipPath(clip)
    paint.style = Paint.Style.FILL
    paint.color = background
    canvas.drawCircle(cx, cy, radius, paint)

    val bitmap = photo
    if (bitmap != null) {
      // Centre-crop the photo into the circle.
      val scale = max(size / bitmap.width, size / bitmap.height)
      val matrix = Matrix().apply {
        postScale(scale, scale)
        postTranslate(cx - bitmap.width * scale / 2f, cy - bitmap.height * scale / 2f)
      }
      canvas.drawBitmap(bitmap, matrix, paint)
    } else {
      drawSilhouette(canvas, cx, cy, size * 0.62f)
    }
    canvas.restore()

    paint.style = Paint.Style.STROKE
    paint.strokeWidth = borderWidth
    paint.color = border
    canvas.drawCircle(cx, cy, radius - borderWidth / 2f, paint)
  }

  // Same shape as the mockup's SVG (100-unit box): head r19 at (50,35), body below.
  private fun drawSilhouette(canvas: Canvas, cx: Float, cy: Float, box: Float) {
    val unit = box / 100f
    val left = cx - box / 2f
    val top = cy - box / 2f
    paint.color = figure
    canvas.drawCircle(left + 50 * unit, top + 35 * unit, 19 * unit, paint)
    canvas.drawArc(RectF(left + 13 * unit, top + 62 * unit, left + 87 * unit, top + 128 * unit), 180f, 180f, true, paint)
  }

  private fun decode(uri: String): Bitmap? = try {
    val path = Uri.parse(uri).path
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(path, bounds)
    var sample = 1
    while (max(bounds.outWidth, bounds.outHeight) / (sample * 2) >= TARGET_PX) sample *= 2
    BitmapFactory.decodeFile(path, BitmapFactory.Options().apply { inSampleSize = sample })
  } catch (e: Exception) {
    null
  }

  companion object {
    private const val TARGET_PX = 600
  }
}
