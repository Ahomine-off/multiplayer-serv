(function(Scratch) {
  'use strict';

  class ChatonMultiverse {
    constructor() {
      this._serveur = 'wss://carpal-ionian-leotard.glitch.me';
      this._salle = 'default';
      this._dernierMessage = '';
      this._dernierType = '';
      this._connecte = false;

      this._connecter();
    }

    _connecter() {
      try {
        this.socket = new WebSocket(this._serveur);

        this.socket.onopen = () => {
          this._connecte = true;
          console.log('🟢 Connecté à', this._serveur);
        };

        this.socket.onclose = () => {
          this._connecte = false;
          console.warn('🔌 Déconnecté de', this._serveur);
        };

        this.socket.onerror = (err) => {
          console.warn('❌ Erreur WebSocket :', err);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.salle === this._salle) {
              this._dernierMessage = data.contenu || '';
              this._dernierType = data.type || '';
              console.log(`📩 Reçu de ${data.salle}: ${data.contenu} (type: ${data.type})`);
            }
          } catch (e) {
            console.warn('⚠️ Message non JSON :', event.data);
          }
        };
      } catch (e) {
        console.warn('⚠️ Problème de connexion :', e);
      }
    }

    getInfo() {
      return {
        id: 'chatonmultiverse',
        name: 'Chaton Multiverse v3',
        color1: '#ff79c6',
        blocks: [
          {
            opcode: 'definirServeur',
            blockType: Scratch.BlockType.COMMAND,
            text: 'définir le serveur à [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'wss://carpal-ionian-leotard.glitch.me' }
            }
          },
          {
            opcode: 'definirSalle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'définir la salle à [SALLE]',
            arguments: {
              SALLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'default' }
            }
          },
          {
            opcode: 'envoyerMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: 'envoyer [TEXTE] (type [TYPE])',
            arguments: {
              TEXTE: { type: Scratch.ArgumentType.STRING, defaultValue: 'miaw' },
              TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: 'chat' }
            }
          },
          {
            opcode: 'lireDernierMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: 'dernier message reçu'
          },
          {
            opcode: 'lireTypeDernierMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: 'type du dernier message'
          },
          {
            opcode: 'lireSalle',
            blockType: Scratch.BlockType.REPORTER,
            text: 'valeur de la salle'
          },
          {
            opcode: 'estConnecte',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'connecté au serveur ?'
          }
        ]
      };
    }

    definirServeur(args) {
      this._serveur = args.URL || 'wss://carpal-ionian-leotard.glitch.me';
      console.log('🌐 Nouveau serveur :', this._serveur);
      this._connecte = false;
      if (this.socket) {
        this.socket.close();
      }
      this._connecter();
    }

    definirSalle(args) {
      this._salle = args.SALLE || 'default';
    }

    envoyerMessage(args) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const paquet = {
          salle: this._salle,
          type: args.TYPE,
          contenu: args.TEXTE
        };
        this.socket.send(JSON.stringify(paquet));
      } else {
        console.warn('⚠️ Pas connecté au serveur WebSocket.');
      }
    }

    lireDernierMessage() {
      return this._dernierMessage;
    }

    lireTypeDernierMessage() {
      return this._dernierType;
    }

    lireSalle() {
      return this._salle;
    }

    estConnecte() {
      return this._connecte;
    }
  }

  Scratch.extensions.register(new ChatonMultiverse());
})(Scratch);
