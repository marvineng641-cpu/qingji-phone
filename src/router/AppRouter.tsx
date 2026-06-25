import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomeScreen from '../pages/HomeScreen'
import Settings from '../pages/Settings'
import MobileConsole from '../components/MobileConsole'
import Worldbook from '../pages/Worldbook'
import QQChat from '../pages/QQChat'
import QQMain from '../pages/QQMain'
import QQGroupChat from '../pages/QQGroupChat'
import QQDynamic from '../pages/QQDynamic'
import Profile from '../pages/Profile'
import CoupleSpace from '../pages/CoupleSpace'
import CoupleTasks from '../pages/CoupleTasks'
import CoupleSubPages from '../pages/CoupleSubPages'
import Xiaohongshu from '../pages/Xiaohongshu'
import Waimai from '../pages/Waimai'
import Taobao from '../pages/Taobao'
import Alipay from '../pages/Alipay'
import XApp from '../pages/XApp'
import AppStore from '../pages/AppStore'
import Wallpaper from '../pages/Wallpaper'
import Storage from '../pages/Storage'
import Memo from '../pages/Memo'
import Widgets from '../pages/Widgets'
import CheckPhone from '../pages/CheckPhone'

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/console" element={<MobileConsole />} />
      <Route path="/worldbook" element={<Worldbook />} />
      <Route path="/qq" element={<QQMain />} />
      <Route path="/qq/chat/:characterId" element={<QQChat />} />
      <Route path="/qq/group/:groupId" element={<QQGroupChat />} />
      <Route path="/qq/dynamic" element={<QQDynamic />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/couplespace" element={<CoupleSpace />} />
      <Route path="/coupletasks" element={<CoupleTasks />} />
      <Route path="/couplesubpages" element={<CoupleSubPages />} />
      <Route path="/xiaohongshu" element={<Xiaohongshu />} />
      <Route path="/waimai" element={<Waimai />} />
      <Route path="/taobao" element={<Taobao />} />
      <Route path="/alipay" element={<Alipay />} />
      <Route path="/xapp" element={<XApp />} />
      <Route path="/appstore" element={<AppStore />} />
      <Route path="/wallpaper" element={<Wallpaper />} />
      <Route path="/storage" element={<Storage />} />
      <Route path="/memo" element={<Memo />} />
      <Route path="/widgets" element={<Widgets />} />
      <Route path="/checkphone" element={<CheckPhone />} />
    </Routes>
  )
}

export default AppRouter
