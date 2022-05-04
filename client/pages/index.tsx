import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { createContext, useState } from 'react'
import ChatBox from '../components/Chatbox'
import Body from '../components/HMRC/Body'
import Header from '../components/HMRC/Header'
import styles from '../styles/Home.module.css'
import { ChevronDownIcon, XIcon, ChatIcon } from '@heroicons/react/solid'
import Footer from '../components/HMRC/footer'

export const IndexContext = createContext({
  setShowCleo: (showCleo: boolean) => { },
});

const Home: NextPage = () => {
  const [showCleo, setShowCleo] = useState(false);

  return (
    <IndexContext.Provider value={{setShowCleo}}>
      <div>
        <Header />
        <div style={{ marginTop: 15 }}>
          <Body />
        </div>
        <div>
          <Footer />
        </div>
        <div>
          {showCleo ? (
            <div className="fixed right-24 bottom-32 scale-up-bottom">
              <ChatBox />
            </div>
          ) : (
            <></>
          )}
          <div className='float-right fixed right-12 bottom-8 m-8'>
            <button className="rounded-full bg-BluePrimary relative p-2" onClick={() => {
              setShowCleo(!showCleo);
            }} >
              <ChatIcon className='text-white h-10 w-10' />
            </button>
          </div>
        </div>
        {/* <ChatBox /> */}
      </div>
    </IndexContext.Provider>
  )
}

export default Home
