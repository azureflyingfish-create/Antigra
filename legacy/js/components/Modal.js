export class Modal {
    constructor() {
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.overlay.style.display = 'none';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.zIndex = '1000';

        document.body.appendChild(this.overlay);
    }

    show(contentHtml, onConfirm, onCancel) {
        this.overlay.innerHTML = `
      <div class="modal-card" style="background: white; padding: 2rem; border-radius: 0.5rem; min-width: 400px; max-width: 90%;">
        ${contentHtml}
        <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem; gap: 1rem;">
          <button id="modal-cancel-btn" class="btn" style="border: 1px solid var(--color-border);">Cancel</button>
          <button id="modal-confirm-btn" class="btn btn-primary">Confirm</button>
        </div>
      </div>
    `;

        this.overlay.style.display = 'flex';

        // Auto-focus first input
        const firstInput = this.overlay.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();

        // Event Listeners
        this.overlay.querySelector('#modal-cancel-btn').onclick = () => {
            this.close();
            if (onCancel) onCancel();
        };

        this.overlay.querySelector('#modal-confirm-btn').onclick = () => {
            if (onConfirm()) {
                this.close();
            }
        };
    }

    close() {
        this.overlay.style.display = 'none';
        this.overlay.innerHTML = '';
    }
}

export const modal = new Modal();
