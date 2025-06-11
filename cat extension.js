(function(Scratch) {
  'use strict';

  const locale = (Scratch.locale || '').toLowerCase();
  const isFrench = locale.startsWith('fr');

  const blocs = {
    definirServeur: {
      en: 'set server to [URL]',
      fr: 'définir le serveur à [URL]'
    },
    definirSalle: {
      en: 'set room to [ROOM]',
      fr: 'définir la salle à [SALLE]'
    },
    envoyerMessage: {
      en: 'send [TEXT] (type [TYPE])',
      fr: 'envoyer [TEXTE] (type [TYPE])'
    },
    dernierMessage: {
      en: 'last received message',
      fr: 'dernier message reçu'
    },
    dernierType: {
      en: 'type of last message',
      fr: 'type du dernier message'
    },
    lireSalle: {
      en: 'current room',
      fr: 'salle actuelle'
    },
    estConnecte: {
      en: 'connected to server?',
      fr: 'connecté au serveur ?'
    },
    lireServeur: {
      en: 'current server URL',
      fr: 'URL du serveur actuel'
    }
  };

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
              console.log(`📩 Reçu de ${data.salle} :`, data.contenu);
            }
          } catch (e) {
            console.warn('⚠️ Message non lisible :', event.data);
          }
        };
      } catch (e) {
        console.warn('⚠️ Erreur lors de la connexion :', e);
      }
    }

    getInfo() {
      return {
        id: 'chatonmultiverse',
        name: isFrench ? 'Chaton Multiverse' : 'Chaton Multiverse',
        color1: '#ff79c6',
        blocks: [
          {
            opcode: 'definirServeur',
            blockType: Scratch.BlockType.COMMAND,
            text: blocs.definirServeur[isFrench ? 'fr' : 'en'],
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: this._serveur
              }
            }
          },
          {
            opcode: 'definirSalle',
            blockType: Scratch.BlockType.COMMAND,
            text: blocs.definirSalle[isFrench ? 'fr' : 'en'],
            arguments: {
              ROOM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: this._salle
              }
            }
          },
          {
            opcode: 'envoyerMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: blocs.envoyerMessage[isFrench ? 'fr' : 'en'],
            arguments: {
              TEXTE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: isFrench ? 'miaw' : 'miaw'
              },
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: isFrench ? 'chat' : 'chat'
              }
            }
          },
          {
            opcode: 'lireDernierMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: blocs.dernierMessage[isFrench ? 'fr' : 'en']
          },
          {
            opcode: 'lireTypeDernierMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: blocs.dernierType[isFrench ? 'fr' : 'en']
          },
          {
            opcode: 'lireSalle',
            blockType: Scratch.BlockType.REPORTER,
            text: blocs.lireSalle[isFrench ? 'fr' : 'en']
          },
          {
            opcode: 'estConnecte',
            blockType: Scratch.BlockType.BOOLEAN,
            text: blocs.estConnecte[isFrench ? 'fr' : 'en']
          },
          {
            opcode: 'lireServeur',
            blockType: Scratch.BlockType.REPORTER,
            text: blocs.lireServeur[isFrench ? 'fr' : 'en']
          }
        ]
      };
    }

    definirServeur(args) {
      this._serveur = args.URL || this._serveur;
      if (this.socket) this.socket.close();
      this._connecte = false;
      this._connecter();
    }

    definirSalle(args) {
      this._salle = args.ROOM || 'default';
    }

    envoyerMessage(args) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const paquet = {
          salle: this._salle,
          type: args.TYPE,
          contenu: args.TEXTE
        };
        this.socket.send(JSON.stringify(paquet));
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

    lireServeur() {
      return this._serveur;
    }
  }

  Scratch.extensions.register(new ChatonMultiverse());
})(Scratch);