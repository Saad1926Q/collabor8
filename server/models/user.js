export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: DataTypes.STRING,
      github_username: DataTypes.STRING,
      email: DataTypes.STRING,
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'users',
      timestamps: false
    });
  
    User.associate = models => {
      User.hasMany(models.Room, { foreignKey: 'leader_id' });
      User.hasMany(models.RoomMember, { foreignKey: 'user_id' });
      User.hasMany(models.ChatMessage, { foreignKey: 'user_id' });
      User.hasMany(models.VoiceParticipant, { foreignKey: 'user_id' });
    };
  
    return User;
  };
  