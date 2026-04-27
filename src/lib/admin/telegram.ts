type TelegramAdminAlert = {
  title: string;
  message: string;
  targetPath?: string | null;
};

type TelegramSendMessageResult = {
  ok?: boolean;
  description?: string;
};

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return null;
  }

  return { botToken, chatId };
}

function buildTelegramMessage(input: TelegramAdminAlert) {
  const lines = [input.title, input.message];
  const appBaseUrl = process.env.APP_BASE_URL?.trim();

  if (input.targetPath && appBaseUrl) {
    lines.push(`Open: ${new URL(input.targetPath, appBaseUrl).toString()}`);
  } else if (input.targetPath) {
    lines.push(`Path: ${input.targetPath}`);
  }

  return lines.join("\n");
}

export async function sendTelegramAdminAlert(input: TelegramAdminAlert) {
  const config = getTelegramConfig();

  if (!config) {
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: buildTelegramMessage(input),
      }),
      cache: "no-store",
    });
    const rawResponse = await response.text();
    let payload: TelegramSendMessageResult | null = null;

    try {
      payload = JSON.parse(rawResponse) as TelegramSendMessageResult;
    } catch {
      payload = null;
    }

    if (!response.ok || !payload?.ok) {
      console.error(
        "Failed to send Telegram admin alert",
        payload?.description || rawResponse || `HTTP ${response.status}`,
      );
    }
  } catch (error) {
    console.error("Failed to send Telegram admin alert", error);
  }
}