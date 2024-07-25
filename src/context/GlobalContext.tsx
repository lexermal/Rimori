/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';
import { createContext, useContext } from 'react';

// Define the shape of the context
interface IGlobalContext {
  subscribe: (event: string, callback: Function) => Destructor | void;
  publish: (event: string, data: any) => void;
}

export type Destructor = () => void;

// Create the context with default values
const GlobalContext = createContext<IGlobalContext>({
  subscribe: () => { },
  publish: () => { },
});

const listeners: {
  [key: string]: { callbacks: Function[]; isBlocked: boolean };
} = {};
console.log('creating listers');

// Create a provider component
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const subscribe = (event: string, callback: Function) => {
    console.log('subscribe', event);
    if (!listeners[event]) {
      listeners[event] = { callbacks: [callback], isBlocked: false };
    } else {
      listeners[event].callbacks.push(callback);
    }

    // Return an unsubscribe function
    return () => {
      listeners[event].callbacks = listeners[event].callbacks.filter(
        (listener) => listener !== callback,
      );
      listeners[event].isBlocked = false;
      console.log('unsubscribe', event);
    };
  };

  const publish = (event: string, data: any) => {
    if (!listeners[event] || listeners[event].isBlocked) {
      console.log('Listener does not exit?', !listeners[event]);
      console.log(
        `listener execution for ${event} is blocked? `,
        listeners[event].isBlocked,
      );
      return;
    }

    listeners[event].isBlocked = true;
    console.log('blocking listeners for ', event, 'event.');
    console.log('listeners: ', listeners[event].callbacks);
    listeners[event].callbacks.forEach((callback) => callback(data));
  };

  return (
    <GlobalContext.Provider value={{ subscribe, publish }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Create a custom hook for using the global context
export const useGlobalContext = () => useContext(GlobalContext);
