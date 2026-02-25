export interface WhatsAppService {
  sendMessage(phone: string, message: string): Promise<void>;
}

export class MockWhatsAppService implements WhatsAppService {
  public sentMessages: Array<{ phone: string; message: string }> = [];

  async sendMessage(phone: string, message: string): Promise<void> {
    console.log(`[MockWhatsApp] To ${phone}: ${message}`);
    this.sentMessages.push({ phone, message });
  }
}
