import Article from './pages/Article';
import Category from './pages/Category';
import ChannelsManager from './pages/ChannelsManager';
import Home from './pages/Home';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import NewsLoader from './pages/NewsLoader';
import PublicReports from './pages/PublicReports';
import Schedule from './pages/Schedule';
import VOD from './pages/VOD';
import VODPlayer from './pages/VODPlayer';
import WarRoom from './pages/WarRoom';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Article": Article,
    "Category": Category,
    "ChannelsManager": ChannelsManager,
    "Home": Home,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "NewsLoader": NewsLoader,
    "PublicReports": PublicReports,
    "Schedule": Schedule,
    "VOD": VOD,
    "VODPlayer": VODPlayer,
    "WarRoom": WarRoom,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};