interface Message {
  type: 'user' | 'assistant' | 'suggestions';
  content: string | string[];
}

export class Chatbot {
  private messages: Message[] = [];
  private messagesContainer!: HTMLElement;
  private form!: HTMLFormElement;
  private input!: HTMLInputElement;
  private window!: HTMLElement;
  private trigger!: HTMLElement;
  private navTrigger!: HTMLElement;
  private closeButton!: HTMLElement;
  private suggestionButtons: HTMLButtonElement[] = [];

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
    const navTrigger = document.getElementById('nav-chatbot-trigger');
    const closeButton = document.getElementById('close-chatbot');

    if (!messagesContainer || !form || !input || !window || !trigger || !navTrigger || !closeButton) {
      throw new Error('No se pudieron encontrar los elementos necesarios del chatbot');
    }

    this.messagesContainer = messagesContainer;
    this.form = form as HTMLFormElement;
    this.input = input as HTMLInputElement;
    this.window = window;
    this.trigger = trigger;
    this.navTrigger = navTrigger;
    this.closeButton = closeButton;
    this.suggestionButtons = Array.from(document.querySelectorAll('.suggestion-btn'));
  }

  private setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.trigger.addEventListener('click', () => {
      this.toggleWindow();
      this.trigger.classList.add('hidden');
    });
    this.navTrigger.addEventListener('click', () => {
      this.toggleWindow();
      this.trigger.classList.add('hidden');
    });
    this.closeButton.addEventListener('click', () => {
      this.toggleWindow();
      this.trigger.classList.remove('hidden');
    });
    this.suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const question = button.textContent?.trim() || '';
        if (question) {
          this.input.value = question;
          this.handleSubmit(new Event('submit'));
          // Ocultar todas las sugerencias después de seleccionar una
          this.suggestionButtons.forEach(btn => {
            btn.style.display = 'none';
          });
        }
      });
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
    messageElement.className = `flex ${
      message.type === 'user' 
        ? 'justify-end' 
        : message.type === 'suggestions' 
          ? 'justify-center flex-col gap-2' 
          : 'justify-start'
    }`;
    
    if (message.type === 'suggestions' && Array.isArray(message.content)) {
      messageElement.innerHTML = message.content
        .map(suggestion => `
          <button class="suggestion-btn group w-full max-w-[85%] sm:max-w-[80%] text-left px-4 py-3 rounded-xl 
            bg-white/20 dark:bg-white/5
            hover:bg-white/30 dark:hover:bg-white/10
            backdrop-blur-sm border border-white/10 dark:border-white/5
            transition-all duration-300 text-sm
            hover:scale-[1.02] hover:shadow-md
            text-black/80 dark:text-white/90
            relative overflow-hidden">
            <span class="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-black/70 dark:text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${suggestion}
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        `).join('');
    } else {
      messageElement.innerHTML = `
        <div class="max-w-[80%] rounded-2xl p-4 ${
          message.type === 'user' 
            ? 'bg-yellow-500/90 text-white backdrop-blur-sm' 
            : 'bg-white/60 dark:bg-gray-700/60 text-black dark:text-white backdrop-blur-sm'
        }">
          ${message.content as string}
        </div>
      `;
    }

    this.messagesContainer.appendChild(messageElement);
    this.scrollToBottom();
    
    // Actualizar los botones de sugerencias después de añadirlos
    if (message.type === 'suggestions') {
      this.suggestionButtons = Array.from(messageElement.querySelectorAll('.suggestion-btn'));
      this.setupSuggestionListeners();
    }
  }

  private scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private toggleWindow() {
    const isOpening = this.window.classList.contains('hidden');
    this.window.classList.toggle('hidden');
    
    if (isOpening) {
      this.trigger.classList.add('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      this.trigger.classList.remove('hidden');
      document.body.style.overflow = '';
    }
  }

  private setupSuggestionListeners() {
    this.suggestionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const question = button.textContent?.trim() || '';
        if (question) {
          this.input.value = question;
          this.handleSubmit(new Event('submit'));
          // Ocultar todas las sugerencias después de seleccionar una
          this.suggestionButtons.forEach(btn => {
            btn.style.display = 'none';
          });
        }
      });
    });
  }
} 