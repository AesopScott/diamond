export function surfaceVideoErrorInDraft(postDraft) {
  if (!postDraft || !postDraft.videoGenerationError) {
    return null;
  }

  return {
    visible: true,
    severity: postDraft.videoGenerationRetryable ? "warning" : "error",
    code: postDraft.videoGenerationError.code,
    message: postDraft.videoGenerationError.message,
    timestamp: postDraft.videoGenerationError.timestamp,
    canRetry: postDraft.videoGenerationRetryable && postDraft.videoGenerationAttempts < 3,
    attemptCount: postDraft.videoGenerationAttempts || 0,
  };
}

export function buildVideoErrorNotificationPayload(postPackage, postDraft) {
  if (!postDraft?.videoGenerationError || postDraft.videoGenerationAttempts < 3) {
    return null;
  }

  return {
    type: "video_generation_failed",
    priority: "high",
    postId: postPackage?.id || postDraft?.id,
    postTitle: postPackage?.title || "Untitled",
    campaign: postPackage?.campaignId,
    error: {
      code: postDraft.videoGenerationError.code,
      message: postDraft.videoGenerationError.message,
    },
    attempts: postDraft.videoGenerationAttempts,
    maxAttempts: 3,
    timestamp: new Date().toISOString(),
  };
}

export async function sendVideoErrorNotification(payload, notificationConfig = {}) {
  if (!payload) return null;

  const emailService = notificationConfig.emailService || process.env.NOTIFICATION_EMAIL_SERVICE || "sendgrid";
  const fromEmail = notificationConfig.fromEmail || process.env.NOTIFICATION_EMAIL_FROM || "noreply@diamond.local";
  const toEmail = notificationConfig.toEmail;

  if (!toEmail) {
    return {
      ok: false,
      error: "No recipient email configured",
    };
  }

  try {
    const emailContent = formatVideoErrorEmail(payload);

    if (emailService === "sendgrid") {
      return await sendViaService("sendgrid", {
        from: fromEmail,
        to: toEmail,
        subject: `[Diamond] Video generation failed: ${payload.postTitle}`,
        html: emailContent,
      });
    }

    if (emailService === "ses") {
      return await sendViaService("ses", {
        from: fromEmail,
        to: toEmail,
        subject: `[Diamond] Video generation failed: ${payload.postTitle}`,
        html: emailContent,
      });
    }

    return {
      ok: false,
      error: `Unknown email service: ${emailService}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || "Failed to send notification",
    };
  }
}

function formatVideoErrorEmail(payload) {
  return `
    <h2>Video Generation Failed</h2>
    <p>Video generation failed for post: <strong>${escapeHtml(payload.postTitle)}</strong></p>
    <dl>
      <dt>Error:</dt>
      <dd>${escapeHtml(payload.error.message)} (${escapeHtml(payload.error.code)})</dd>
      <dt>Attempts:</dt>
      <dd>${payload.attempts} of ${payload.maxAttempts}</dd>
      <dt>Post ID:</dt>
      <dd>${escapeHtml(payload.postId)}</dd>
      <dt>Campaign:</dt>
      <dd>${escapeHtml(payload.campaign || "Unknown")}</dd>
      <dt>Time:</dt>
      <dd>${new Date(payload.timestamp).toLocaleString()}</dd>
    </dl>
    <p>Please review the post and retry video generation or proceed without it.</p>
  `;
}

async function sendViaService(service, options) {
  if (service === "sendgrid") {
    if (!process.env.SENDGRID_API_KEY) {
      return { ok: false, error: "SENDGRID_API_KEY not configured" };
    }
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: options.from },
          subject: options.subject,
          content: [{ type: "text/html", value: options.html }],
        }),
      });
      return { ok: response.ok, statusCode: response.status };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  if (service === "ses") {
    return { ok: false, error: "SES not yet implemented" };
  }

  return { ok: false, error: `Unsupported service: ${service}` };
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
