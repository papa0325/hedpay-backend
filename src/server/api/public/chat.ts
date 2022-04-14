import axios from 'axios';
import { Op } from 'sequelize';
import config from '../../config/config';
import { Chat } from '../../models/Chat';
import { ChatLine } from '../../models/ChatLine';
import { User } from '../../models/User';
import { error, getUUID, output } from '../../utils';
import * as FileType from 'file-type';

import * as btoa from 'btoa';
import { ChatLineAttachment } from '../../models/ChatLineAttachment';

const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);

interface IChatPreview {
  chatID: number;
  username: string;
  active: boolean;
  lastMessage: string;
  lastSender: Object;
}

interface IFile {
  fileExtension: string;
  data: string;
}

const startChat = async (r) => {
  try {
    const newChat: Chat = await Chat.create({
      userId: r.auth.credentials.id,
      active: true,
    });
    return output({ chatID: newChat.id, messagesCount: 0, data: [] });
  } catch (err) {
    console.log(err);
    return error(500000, 'Failed to create a chat', {});
  }
};

const sendMessage = async (r) => {
  try {
    const message = r.payload.message;
    const attachments = r.payload.file;

    let chat: Chat | null;
    const sender: User = r.auth.credentials;
    if (!message && !attachments)
      return error(400000, 'Either message or attachments have to be sent', null);

    chat = await Chat.findOne({
      where: {
        [Op.and]: [{ userId: sender.id }, { active: true }],
      },
    });
    if (!chat)
      chat = await Chat.create({
        userId: sender.id,
        active: true,
      });

    const attachmentsArray = [];

    if (attachments) {
      const files = Array.isArray(attachments) ? [...attachments] : [attachments];
      for await (let file of files) {
        let fileUUID = getUUID();
        if (!Buffer.isBuffer(file)) return error(400000, 'This file type is now allowed', null);
        let fileExt = await FileType.fromBuffer(file);
        if (!fileExt || !fileExt.ext.match(config.files.allowedExtensions))
          return error(400000, 'This file type is now allowed', null);
        let fileName = fileUUID + '.' + fileExt.ext;
        const newAttachment = {
          file: fileName,
          ext: fileExt,
        };
        attachmentsArray.push(newAttachment);
        await fs.writeFileSync(config.files.filesDir + fileName, file, (err) => {
          if (err) return console.log(err);
        });
      }
    }

    const newChatLine: ChatLine = await ChatLine.create(
      {
        chatID: chat.id,
        sender: { type: 'user', senderID: sender.id },
        message: message,
        timestamp: Math.round(Date.now() / 1000),
        attachments: attachmentsArray,
      },
      {
        include: [
          {
            model: ChatLineAttachment,
            as: 'attachments',
          },
        ],
      }
    );

    const senderObj = {} as any;
    senderObj.type = 'user';
    senderObj.userId = chat.userId;
    senderObj.senderId = sender.id;
    senderObj.senderUsername = sender.username;

    r.server.publish(`/user/chat/${chat.id}`, {
      chatID: chat.id,
      sender: senderObj,
      message: message,
      timestamp: newChatLine.timestamp,
      attachments: newChatLine.attachments,
    });

    //send message to admin service
    await axios.post(
      config.chat.adminBackendWSUrl + 'admin/chats/send-ws',
      {
        chatLineId: newChatLine.id,
      },
      {
        headers: {
          'content-type': 'application/json',
          Authorization:
            'Basic ' +
            btoa(config.chat.adminBackendUsername + ':' + config.chat.adminBackendPassword),
        },
      }
    );

    return output({ message: 'Message was sent', id: chat.id, chatLineId: newChatLine.id });
  } catch (err) {
    console.log(err);
    return error(500000, 'Failed to send a message to the chat', {});
  }
};

const getMessages = async (r, type) => {
  const user = await User.findByPk(r.auth.credentials.id);
  if (!user) return error(404000, 'User with given accessToken was not found', {});
  const chat = await Chat.findOne({
    where: {
      [Op.and]: [{ userId: user.id }, { active: true }],
    },
  });
  if (!chat) return startChat(r);

  const chatLines = await ChatLine.findAndCountAll({
    where: { chatID: chat.id },
    include: [
      {
        model: ChatLineAttachment,
        as: 'attachments',
      },
    ],
    order: [['id', 'DESC']],
  });

  return output({ chatID: chat.id, messagesCount: chatLines.count, data: chatLines.rows });
};

const sendWS = async (r) => {
  try {
    const newChatLine: ChatLine = await ChatLine.findByPk(r.payload.chatLineId, {
      include: [
        {
          model: ChatLineAttachment,
          as: 'attachments',
        },
      ],
    });
    if (!newChatLine) return error(404000, 'No chat line was found', null);
    console.log('Received message with chatID: ', newChatLine.chatID);
    if (r.payload.files) {
      const files = r.payload.files;
      for (let file of files) {
        let bufferFile = Buffer.from(file.data);
        await fs.writeFileSync(config.files.filesDir + file.fileName, bufferFile, (err) => {
          if (err) return console.log(err);
        });
      }
    }

    await r.server.publish(`/user/chat/${newChatLine.chatID}`, {
      chatID: newChatLine.chatID,
      sender: newChatLine.sender,
      message: newChatLine.message,
      timestamp: newChatLine.timestamp,
      attachments: newChatLine.attachments,
    });

    console.log('Message was sent via WS');
    return output({ message: 'Message was sent via WS' });
  } catch (err) {
    console.error(err);
    return error(500000, 'Failed to send message via websocket (chat)', null);
  }
};

const getFilePath = (r) => {
  const path = config.files.filesDir;
  return path;
};

const checkFileAccess = async (r) => {
  if (!r.params.chatID || !r.params.file)
    return error(400000, 'Incorrect file or chatID params', {});
  const chat: Chat = await Chat.findByPk(r.params.chatID);
  if (!r.auth.credentials.role) {
    if (chat.userId != r.auth.credentials.id)
      return error(403000, 'No access to view this content', {});
    return true;
  }
  return true;
};

export { sendMessage, sendWS, startChat, getMessages, getFilePath, checkFileAccess };
