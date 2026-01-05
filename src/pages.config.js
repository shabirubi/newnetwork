import Article from './pages/Article';
import Category from './pages/Category';
import Home from './pages/Home';
import Live from './pages/Live';
import NewsAdmin from './pages/NewsAdmin';
import Schedule from './pages/Schedule';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Article": Article,
    "Category": Category,
    "Home": Home,
    "Live": Live,
    "NewsAdmin": NewsAdmin,
    "Schedule": Schedule,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};