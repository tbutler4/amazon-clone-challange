import axios from 'axios';

const instance = axios.create({
  baseURL: 'use your desired website' // The api (cloud function) url
});

export default instance;