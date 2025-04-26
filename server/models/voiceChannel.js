export default (sequelize, DataTypes) => {
    const VoiceChannel = sequelize.define('VoiceChannel', {
      room_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'voice_channels',
      timestamps: false
    });
  
    VoiceChannel.associate = models => {
      VoiceChannel.belongsTo(models.Room, { foreignKey: 'room_id' });
      VoiceChannel.hasMany(models.VoiceParticipant, { foreignKey: 'channel_id' });
    };
  
    return VoiceChannel;
  };
  