(function(Scratch) {
  'use strict';

  // ✨ Base commune pour les deux extensions
  class MultiverseBase {
    constructor(lang, nom) {
      this.nom = nom;
      this.langue = lang;
      this.id = lang === 'fr' ? 'chatonmulti' : 'kittenmulti';
      this._serveur = 'wss://carpal-ionian-leotard.glitch.me';
      this._salle = 'default';
      this._msg = '';
      this._type = '';
      this._connecte = false;

      this._connecter();
    }

    _connecter() {
      try {
        this.socket = new WebSocket(this._serveur);
        this.socket.onopen = () => { this._connecte = true; };
        this.socket.onclose = () => { this._connecte = false; };
        this.socket.onerror = () => { this._connecte = false; };
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.salle === this._salle) {
              this._msg = data.contenu || '';
              this._type = data.type || '';
            }
          } catch {}
        };
      } catch {}
    }

    getInfo() {
      const fr = {
        name: 'Chaton Multiverse',
        server: 'définir le serveur à [URL]',
        room: 'définir la salle à [SALLE]',
        send: 'envoyer [TEXTE] (type [TYPE])',
        msg: 'dernier message reçu',
        type: 'type du dernier message',
        salle: 'valeur de la salle',
        serv: 'URL du serveur actuel',
        online: 'connecté au serveur ?'
      };
      const en = {
        name: 'Kitten Multiverse',
        server: 'set server to [URL]',
        room: 'set room to [ROOM]',
        send: 'send [TEXT] (type [TYPE])',
        msg: 'last received message',
        type: 'type of last message',
        salle: 'current room',
        serv: 'current server URL',
        online: 'connected to server?'
      };

      const t = this.langue === 'fr' ? fr : en;

      return {
        id: this.id,
        name: t.name,
        color1: this.langue === 'fr' ? '#ff69b4' : '#87ceeb',
        blocks: [
          {
            opcode: 'setServer',
            blockType: Scratch.BlockType.COMMAND,
            text: t.server,
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: this._serveur }
            }
          },
          {
            opcode: 'setRoom',
            blockType: Scratch.BlockType.COMMAND,
            text: t.room,
            arguments: {
              SALLE: { type: Scratch.ArgumentType.STRING, defaultValue: this._salle }
            }
          },
          {
            opcode: 'sendMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: t.send,
            arguments: {
              TEXTE: { type: Scratch.ArgumentType.STRING, defaultValue: 'miaw' },
              TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: 'chat' }
            }
          },
          {
            opcode: 'getMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: t.msg
          },
          {
            opcode: 'getType',
            blockType: Scratch.BlockType.REPORTER,
            text: t.type
          },
          {
            opcode: 'getRoom',
            blockType: Scratch.BlockType.REPORTER,
            text: t.salle
          },
          {
            opcode: 'getServerURL',
            blockType: Scratch.BlockType.REPORTER,
            text: t.serv
          },
          {
            opcode: 'isConnected',
            blockType: Scratch.BlockType.BOOLEAN,
            text: t.online
          }
        ]
      };
    }

    setServer(args) {
      this._serveur = args.URL || this._serveur;
      if (this.socket) this.socket.close();
      this._connecte = false;
      this._connecter();
    }

    setRoom(args) {
      this._salle = args.SALLE || 'default';
    }

    sendMessage(args) {
      if (this.socket?.readyState === WebSocket.OPEN) {
        const packet = { salle: this._salle, type: args.TYPE, contenu: args.TEXTE };
        this.socket.send(JSON.stringify(packet));
      }
    }

    getMessage() {
      return this._msg;
    }

    getType() {
      return this._type;
    }

    getRoom() {
      return this._salle;
    }

    getServerURL() {
      return this._serveur;
    }

    isConnected() {
      return this._connecte;
    }
  }

  // Enregistrement des deux extensions
  Scratch.extensions.register(new MultiverseBase('fr', 'Chaton Multiverse'));
  Scratch.extensions.register(new MultiverseBase('en', 'Kitten Multiverse'));
})(Scratch);
