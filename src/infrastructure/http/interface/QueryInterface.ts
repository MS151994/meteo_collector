import {Headers, Method} from 'got/dist/source/core';

export interface QueryInterface {
  url: string;
  method: Method;
  headers: Headers;
}
