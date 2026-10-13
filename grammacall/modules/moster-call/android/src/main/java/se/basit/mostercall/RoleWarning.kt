package se.basit.mostercall

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log

// If something (e.g. opening Samsung's Phone app) takes the dialer role back,
// auto-answer and outgoing calls stop silently. This puts a sticky notification
// up for whoever in the family looks at the phone next.
object RoleWarning {
  private const val CHANNEL = "moster-status"
  private const val ID = 1001

  fun update(context: Context, show: Boolean) {
    val manager = context.getSystemService(NotificationManager::class.java)
    if (!show) {
      manager.cancel(ID)
      return
    }
    try {
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL, "Status för GrammaCall", NotificationManager.IMPORTANCE_HIGH)
      )
      val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
        ?: Intent().setPackage(context.packageName)
      val open = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE)
      val text = "Appen är inte längre standardapp för telefon och svarar inte automatiskt. " +
        "Öppna inställningarna i appen och tryck på \"Gör till standardapp för telefon\"."
      val notification = android.app.Notification.Builder(context, CHANNEL)
        .setSmallIcon(android.R.drawable.stat_sys_warning)
        .setContentTitle("GrammaCall tar inte emot samtal")
        .setContentText(text)
        .setStyle(android.app.Notification.BigTextStyle().bigText(text))
        .setContentIntent(open)
        .setOngoing(true)
        .build()
      manager.notify(ID, notification)
    } catch (e: Exception) {
      Log.e(MosterInCallService.TAG, "could not show role warning", e)
    }
  }
}
