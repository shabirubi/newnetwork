import Home from './pages/Home';
import Live from './pages/Live';
import Category from './pages/Category';
import Schedule from './pages/Schedule';
import Article from './pages/Article';
import NewsAdmin from './pages/NewsAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Live": Live,
    "Category": Category,
    "Schedule": Schedule,
    "Article": Article,
    "NewsAdmin": NewsAdmin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};