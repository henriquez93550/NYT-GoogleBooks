import React from 'react';
import { FaHome } from 'react-icons/fa/';
import { MdStar } from 'react-icons/md/';
import { GoMarkGithub } from 'react-icons/go/';

export const Menu = ({ setVisibility, visibility }) => {
    const color = { color: '#BDBDBD' };

    const showFavorites = () => {
        console.log(visibility);
        setVisibility({
            highlight: false,
            booklist: false,
            favorites: true
        });
    }

    const showHome = () => {
        setVisibility({
            highlight: false,
            booklist: true,
            favorites: false
        });
    }

    return (
        <nav aria-label="App navigation" id="app-nav">
            <span>{visibility.favorites ?
                <MdStar style={color} /> :
                <MdStar onClick={() => showFavorites()} />}</span>
            <span>{visibility.favorites ?
                <FaHome onClick={() => showHome()} /> :
                <FaHome style={color} />}</span>
            <span><a href="https://github.com/henriquez93550/NYT-GoogleBooks"><GoMarkGithub /></a></span>
        </nav>
    )
}