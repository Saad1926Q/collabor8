export default (sequelize, DataTypes) => {
    const VoiceParticipant = sequelize.define('VoiceParticipant', {
      channel_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'voice_participants',
      timestamps: false
    });
  
    VoiceParticipant.associate = models => {
      VoiceParticipant.belongsTo(models.User, { foreignKey: 'user_id' });
      VoiceParticipant.belongsTo(models.VoiceChannel, { foreignKey: 'channel_id' });
    };
  
    return VoiceParticipant;
  };
  