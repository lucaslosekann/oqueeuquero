import { parseCookies } from 'nookies';
import Router from 'next/router'
const {'oqueeuquero.token' : token} = parseCookies()
export const baseURL = 'https://oqueeuquero-server.vercel.app';
export const api = require('axios').create({
  baseURL,
  timeout: 2000,
});

if(token){
  api.defaults.headers['Authorization'] = 'Bearer ' + token;
}

export const signup = (info) => {
  return new Promise(async (resolve, reject) => {
    try{
      const { data } = await api.post('/api/auth/signup', info)
      resolve(data)
    }catch(e){
      if(e.response.data.code == 16){
        return reject({error: true, message: "Usuário já existente"})
      }
      reject(e)
    }
  })
}


export const signin = ({email, password}) => {
  return new Promise(async (resolve, reject) => {
    try{
      const { data } = await api.post('/api/auth/signin', {
        email,
        password
      })
      resolve(data)
    }catch(e){
      if(e.response.data.code == 12){
        return reject({error: true, message: "Email ou senha incorretos"})
      }
      reject(e)
    }
  })
}

export const recoverUserInfo = async () => {
  try{
    const { data : user} = await api.get('/api/user')
    return user;
  }catch(e){
    throw new Error();
  }
}

export const addList = async ({name, ref}) => {
  try{
    const { data } = await api.post('/api/list',{
      name,
      ref
    })
    return data;
  }catch(e){
    if(e.response.data.code == 17){
      return {error: true, message: "Referência já existente"}
    }
    return e;
  }
}

export const getLists = async (token) => {
  try{
    let data;
    if(token){
      ({ data } = await api.get('/api/list',{
        headers:{'Authorization': "Bearer "+ token}
      }))
    }else{
      ({ data } = await api.get('/api/list'))
    }

    return data;
  }catch(e){
    return e;
  }
}

export const checkItem = async ({listRef, listItemId}) => {
  try{
    await api.post('/api/listItem/check',{
      listRef,
      listItemId
    })
  }catch(e){

  }
}

export const addListItem = async (data, listId) => {
  try{
    if(data.links.length <= 0)delete data.links;
    const {data: {id}} = await api.post('/api/listItem', {
      ...data,
      listId
    })
    return id;
  }catch(e){
    return e;
  }
}

export const deleteListItem = async (id) =>{
  try{
    const {data:{deleted}} = await api.delete('/api/listItem',{data: {id}})
    return deleted;
  }catch(e){
    return false;
  }
}
export const deleteList = async (id) =>{
  try{
    const {data:{deleted}} = await api.delete('/api/list',{data: {id}})
    return deleted;
  }catch(e){
    return false;
  }
}

export const uncheck = async (id) =>{
  try{
    await new Promise((resolve, reject) => setTimeout(resolve,2000))
    const {data:{updated, checked}} = await api.post('/api/listItem/uncheck', { id })
    return {updated, checked};
  }catch(e){
    return {updated: false};
  }
}
export const createStripeSession = async ({priceId}) => {
  try{
    const {data} = await api.post('/api/payments/createSession',{ priceId })
    Router.push(data.url)
  }catch(e){
    console.error(e)
  }
}