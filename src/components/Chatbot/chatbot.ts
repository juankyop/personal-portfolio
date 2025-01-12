interface Message {
  type: 'user' | 'assistant';
  content: string;
}

export class Chatbot {
  private messages: Message[] = [];
  private messagesContainer!: HTMLElement;
  private form!: HTMLFormElement;
  private input!: HTMLInputElement;
  private window!: HTMLElement;
  private trigger!: HTMLElement;
  private closeButton!: HTMLElement;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    const messagesContainer = document.getElementById('messages-container');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const window = document.getElementById('chatbot-window');
    const trigger = document.getElementById('chatbot-trigger');
    const closeButton = document.getElementById('close-chatbot');

    if (!messagesContainer || !form || !input || !window || !trigger || !closeButton) {
      throw new Error('No se pudieron encontrar los elementos necesarios del chatbot');
    }

    this.messagesContainer = messagesContainer;
    this.form = form as HTMLFormElement;
    this.input = input as HTMLInputElement;
    this.window = window;
    this.trigger = trigger;
    this.closeButton = closeButton;
  }

  private setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.trigger.addEventListener('click', () => {
      this.toggleWindow();
      this.trigger.classList.add('hidden');
    });
    this.closeButton.addEventListener('click', () => {
      this.toggleWindow();
      this.trigger.classList.remove('hidden');
    });
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const userMessage = this.input.value.trim();
    if (!userMessage) return;

    // Añadir mensaje del usuario
    this.addMessage({ type: 'user', content: userMessage });
    this.input.value = '';

    try {
      // Mostrar indicador de escritura
      this.addMessage({ 
        type: 'assistant', 
        content: '...' 
      });

      // Llamar a la API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta');
      }

      const data = await response.json();
      
      // Reemplazar el indicador de escritura con la respuesta
      const loadingMessage = this.messagesContainer.lastElementChild;
      if (loadingMessage) {
        this.messagesContainer.removeChild(loadingMessage);
      }

      this.addMessage({
        type: 'assistant',
        content: data.response
      });

    } catch (error) {
      console.error('Error:', error);
      this.addMessage({
        type: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, inténtalo de nuevo.'
      });
    }
  }

  private addMessage(message: Message) {
    this.messages.push(message);
    
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`;
    
    messageElement.innerHTML = `
      <div class="max-w-[80%] rounded-2xl p-4 ${
        message.type === 'user' 
          ? 'bg-yellow-500/90 text-white backdrop-blur-sm' 
          : 'bg-white/60 dark:bg-gray-700/60 text-black dark:text-white backdrop-blur-sm'
      }">
        ${message.content}
      </div>
    `;

    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private toggleWindow() {
    const isOpening = this.window.classList.contains('hidden');
    this.window.classList.toggle('hidden');
    
    if (isOpening) {
      this.trigger.classList.add('hidden');
    } else {
      this.trigger.classList.remove('hidden');
    }
  }
} 