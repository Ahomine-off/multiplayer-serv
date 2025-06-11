(function(Scratch) {
  'use strict';

  class ChatonMultiverse {
    constructor() {
      this._salle = 'default';
      this._dernierMessage = '';
      this._dernierType = '';
      this._connecte = false;

      this.socket = new WebSocket('wss://carpal-ionian-leotard.glitch.me');

      this.socket.onopen = () => {
        this._connecte = true;
        console.log('🟢 Connecté au serveur !');
      };

      this.socket.onerror = (err) => {
        console.warn('❌ Erreur WebSocket :', err);
      };

      this.socket.onclose = () => {
        this._connecte = false;
        console.warn('🔌 Déconnecté du serveur.');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.salle === this._salle) {
            this._dernierMessage = data.contenu || '';
            this._dernierType = data.type || '';
            console.log('📩 Reçu de la salle', data.salle, ':', this._dernierMessage);
          }
        } catch (e) {
          console.warn('⚠️ Message non lisible :', event.data);
        }
      };
    }

    getInfo() {
      return {
        id: 'chatonmultiverse',
        name: 'Chaton Multiverse',
        color1: '#ff69b4',
        blocks: [
          {
            opcode: 'choisirSalle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'définir la salle à [SALLE]',
            arguments: {
              SALLE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'default'
              }
            }
          },
          {
            opcode: 'envoyerMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: 'envoyer [MESSAGE] (type [TYPE])',
            arguments: {
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'miaw'
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'chat'
              }
            }
          },
          {
            opcode: 'getDernierMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: 'dernier message reçu'
          },
          {
            opcode: 'getDernierType',
            blockType: Scratch.BlockType.REPORTER,
            text: 'type du dernier message'
          },
          {
            opcode: 'getSalle',
            blockType: Scratch.BlockType.REPORTER,
            text: 'valeur de la salle'
          },
          {
            opcode: 'isConnecte',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'connecté au serveur ?'
          }
        ]
      };
    }

    choisirSalle(args) {
      this._salle = args.SALLE || 'default';
    }

    envoyerMessage(args) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const paquet = {
          salle: this._salle,
          type: args.TYPE,
          contenu: args.MESSAGE
        };
        this.socket.send(JSON.stringify(paquet));
      } else {
        console.warn('⚠️ WebSocket non connecté.');
      }
    }

    getDernierMessage() {
      return this._dernierMessage;
    }

    getDernierType() {
      return this._dernierType;
    }

    getSalle() {
      return this._salle;
    }

    isConnecte() {
      return this._connecte;
    }
  }

  Scratch.extensions.register(new ChatonMultiverse());
})(Scratch);
