import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      github_username: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true
      },
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
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
