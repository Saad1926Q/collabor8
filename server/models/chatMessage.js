export default (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('ChatMessage', {
      room_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      message: DataTypes.TEXT,
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'chat_messages',
      timestamps: false
    });
  
    ChatMessage.associate = models => {
      ChatMessage.belongsTo(models.User, { foreignKey: 'user_id' });
      ChatMessage.belongsTo(models.Room, { foreignKey: 'room_id' });
    };
  
    return ChatMessage;
  };
  