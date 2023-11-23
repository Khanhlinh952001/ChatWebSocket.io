let UserList = [

]

const addUser = (newUser) =>  (UserList=[...UserList,newUser]);
const removeUser = (id) => UserList.filter((user) => user.id !== id);

const getUserList = (room) => UserList.filter((user) => user.room === room );
module.exports={
    getUserList,
    addUser,
    removeUser
}

