import React from 'react';
import PropTypes from 'prop-types';
import { BookRow } from './BookRow';


export const Saved = ({ data, highlight, visibility }) => {

    if (visibility) {
        return (
            <section id="saved"
                aria-label="List of books added to saved">
                {data.map((entry, i) =>
                    <BookRow key={i}
                        rowNumber={i}
                        title={entry.title}
                        author={entry.authors}
                        rating={entry.rating}
                        highlight={highlight}
                    />
                )}
            </section>
        )
    } else {
        return null;
    }
}

Saved.propTypes = {
    data: PropTypes.array
}