export default (sequelize, DataTypes) => {
    const RoomMember = sequelize.define('RoomMember', {
      room_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      role: DataTypes.ENUM('leader', 'member', 'guest')
    }, {
      tableName: 'room_members',
      timestamps: false
    });
  
    RoomMember.associate = models => {
      RoomMember.belongsTo(models.User, { foreignKey: 'user_id' });
      RoomMember.belongsTo(models.Room, { foreignKey: 'room_id' });
    };
  
    return RoomMember;
  };
  