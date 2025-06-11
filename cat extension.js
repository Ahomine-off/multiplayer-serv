(function(Scratch) {
  'use strict';

  const _chatonData = {
    server: 'wss://carpal-ionian-leotard.glitch.me',
    room: 'default',
    lastMessage: '',
    lastType: '',
    connected: false,
    history: [],
    socket: null
  };

  function connecterAuServeur() {
    try {
      _chatonData.socket = new WebSocket(_chatonData.server);
      _chatonData.socket.onopen = () => { _chatonData.connected = true; };
      _chatonData.socket.onclose = () => { _chatonData.connected = false; };
      _chatonData.socket.onerror = () => { _chatonData.connected = false; };
      _chatonData.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.salle === _chatonData.room) {
            if (data.type === 'historique' && Array.isArray(data.contenu)) {
              _chatonData.history.push(...data.contenu.map(x => ({
                contenu: x.contenu, type: x.type
              })));
            } else {
              _chatonData.lastMessage = data.contenu || '';
              _chatonData.lastType = data.type || '';
              _chatonData.history.push({
                contenu: _chatonData.lastMessage,
                type: _chatonData.lastType
              });
            }
          }
        } catch {}
      };
    } catch {}
  }

  connecterAuServeur();

  function createMultiverse(lang) {
    const isFR = lang === 'fr';
    const id = isFR ? 'chatonmulti' : 'kittenmulti';
    const name = isFR ? 'Chaton Multiverse' : 'Kitten Multiverse';
    const color = isFR ? '#ff69b4' : '#87ceeb';
    const t = (key) => ({
      setServer: isFR ? 'définir le serveur à [URL]' : 'set server to [URL]',
      setRoom: isFR ? 'définir la salle à [SALLE]' : 'set room to [ROOM]',
      send: isFR ? 'envoyer [TEXTE] (type [TYPE])' : 'send [TEXT] (type [TYPE])',
      lastMsg: isFR ? 'dernier message reçu' : 'last received message',
      lastType: isFR ? 'type du dernier message' : 'type of last message',
      salle: isFR ? 'valeur de la salle' : 'current room',
      serv: isFR ? 'URL du serveur actuel' : 'current server URL',
      conn: isFR ? 'connecté au serveur ?' : 'connected to server?',
      histLen: isFR ? 'longueur de l\'historique' : 'history length',
      histMsg: isFR ? 'message historique à [INDEX]' : 'historical message [INDEX]',
      histType: isFR ? 'type historique à [INDEX]' : 'historical type [INDEX]',
      demanderHist: isFR ? 'demander l\'historique de la salle' : 'request room history'
    })[key];

    return class {
      getInfo() {
        return {
          id,
          name,
          color1: color,
          blocks: [
            { opcode: 'setServer', blockType: Scratch.BlockType.COMMAND, text: t('setServer'), arguments: { URL: { type: Scratch.ArgumentType.STRING, defaultValue: _chatonData.server } } },
            { opcode: 'setRoom', blockType: Scratch.BlockType.COMMAND, text: t('setRoom'), arguments: { SALLE: { type: Scratch.ArgumentType.STRING, defaultValue: _chatonData.room } } },
            { opcode: 'sendMessage', blockType: Scratch.BlockType.COMMAND, text: t('send'), arguments: { TEXTE: { type: Scratch.ArgumentType.STRING, defaultValue: 'miaw' }, TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: 'chat' } } },
            { opcode: 'getMessage', blockType: Scratch.BlockType.REPORTER, text: t('lastMsg') },
            { opcode: 'getType', blockType: Scratch.BlockType.REPORTER, text: t('lastType') },
            { opcode: 'getRoom', blockType: Scratch.BlockType.REPORTER, text: t('salle') },
            { opcode: 'getServer', blockType: Scratch.BlockType.REPORTER, text: t('serv') },
            { opcode: 'isConnected', blockType: Scratch.BlockType.BOOLEAN, text: t('conn') },
            { opcode: 'getHistoryLength', blockType: Scratch.BlockType.REPORTER, text: t('histLen') },
            { opcode: 'getHistoryMsg', blockType: Scratch.BlockType.REPORTER, text: t('histMsg'), arguments: { INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } } },
            { opcode: 'getHistoryType', blockType: Scratch.BlockType.REPORTER, text: t('histType'), arguments: { INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 } } },
            { opcode: 'requestHistory', blockType: Scratch.BlockType.COMMAND, text: t('demanderHist') }
          ]
        };
      }

      setServer(args) {
        _chatonData.server = args.URL;
        if (_chatonData.socket) _chatonData.socket.close();
        _chatonData.connected = false;
        connecterAuServeur();
      }

      setRoom(args) {
        _chatonData.room = args.SALLE;
      }

      sendMessage(args) {
        if (_chatonData.socket?.readyState === WebSocket.OPEN) {
          const paquet = { salle: _chatonData.room, type: args.TYPE, contenu: args.TEXTE };
          _chatonData.socket.send(JSON.stringify(paquet));
        }
      }

      getMessage() {
        return _chatonData.lastMessage;
      }

      getType() {
        return _chatonData.lastType;
      }

      getRoom() {
        return _chatonData.room;
      }

      getServer() {
        return _chatonData.server;
      }

      isConnected() {
        return _chatonData.connected;
      }

      getHistoryLength() {
        return _chatonData.history.length;
      }

      getHistoryMsg(args) {
        const i = Number(args.INDEX) - 1;
        return _chatonData.history[i]?.contenu || '';
      }

      getHistoryType(args) {
        const i = Number(args.INDEX) - 1;
        return _chatonData.history[i]?.type || '';
      }

      requestHistory() {
        if (_chatonData.socket?.readyState === WebSocket.OPEN) {
          _chatonData.history = [];
          _chatonData.socket.send(JSON.stringify({ action: 'historique', salle: _chatonData.room }));
        }
      }
    };
  }

  Scratch.extensions.register(new (createMultiverse('fr'))());
  Scratch.extensions.register(new (createMultiverse('en'))());
})(Scratch);
