import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: DataTypes.STRING,
      github_username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      refreshToken :{
        type:DataTypes.STRING
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
  