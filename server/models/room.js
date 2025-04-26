export default (sequelize, DataTypes) => {
    const Room = sequelize.define('Room', {
      name: DataTypes.STRING,
      leader_id: DataTypes.INTEGER,
      repo_url: DataTypes.STRING,
      repo_path: DataTypes.TEXT,
      last_opened_file: DataTypes.TEXT,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'rooms',
      timestamps: false
    });
  
    Room.associate = models => {
      Room.belongsTo(models.User, { foreignKey: 'leader_id' });
      Room.hasMany(models.RoomMember, { foreignKey: 'room_id' });
      Room.hasMany(models.ChatMessage, { foreignKey: 'room_id' });
      Room.hasMany(models.VoiceChannel, { foreignKey: 'room_id' });
    };
  
    return Room;
  };
  