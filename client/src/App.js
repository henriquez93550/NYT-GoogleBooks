import React from 'react';
import { Component } from 'react';
import { DashBoard } from './components/DashBoard';
import { Highlight } from './components/Highlight';
import { BookList } from './components/BookList';
import { Saved } from './components/Saved';
import { Menu } from './components/Menu';
import idb from 'idb';
import axios from 'axios';

class App extends Component {

	constructor(props) {
		super(props)
		this.state = {
			items: [
				null
			],
			queryObject: {
				type: 'q=intitle:',
				query: 'lord+of+the'
			},
			highlight: 0,
			visibility: {
				highlight: false,
				booklist: false, 
				saved: false
			},
			saved: [
				null
			]
		}
		this.updateQuery = this.updateQuery.bind(this);
		this.updateHighlight = this.updateHighlight.bind(this);
		this.addSaved = this.addSaved.bind(this);
		this.updateSavedHighlight = this.updateSavedHighlight.bind(this);
		this.updateVisibility = this.updateVisibility.bind(this);
		this.removeSaved = this.removeSaved.bind(this);
	}	

	// Get the results for the search terms entered
	fetchQuery() {
		this.serverRequest = fetch('https://www.googleapis.com/books/v1/volumes?' + this.state.queryObject.type + this.state.queryObject.query)
			.then(response => response.json())
			.then((data) => {
				data.items.forEach((item, i) => {
					let element = {};
					if (typeof item.volumeInfo.title != 'undefined') { 
						element.title = item.volumeInfo.title;
					} else {
						element.title = null;
					}
					if ( typeof item.volumeInfo.authors != 'undefined') {
						element.authors =  item.volumeInfo.authors[0];
					} else {
						element.authors = null;
					}
					if ( typeof item.volumeInfo.averageRating != 'undefined') {
						element.rating =  item.volumeInfo.averageRating;
					} else {
						element.rating = null;
					}
					if ( typeof item.volumeInfo.ratingsCount != 'undefined') {
						element.ratingsCount =  item.volumeInfo.ratingsCount;
					} else {
						element.ratingsCount = null;
					}
					if ( typeof item.volumeInfo.publisher != 'undefined') {
						element.publisher = item.volumeInfo.publisher;
					} else {
						element.publisher = null;
					}
					if ( typeof item.volumeInfo.publishedDate != 'undefined') {
						element.publishedDate = item.volumeInfo.publishedDate;
					} else {
						element.publishedDate = null;
					}
					if ( typeof item.volumeInfo.description != 'undefined') {
						element.description = item.volumeInfo.description;
					} else {
						element.description = null;
					}	
					if ( typeof item.volumeInfo.imageLinks != 'undefined' &&
								typeof item.volumeInfo.imageLinks.thumbnail != 'undefined' ) {
						element.thumbnail = item.volumeInfo.imageLinks.thumbnail.replace(/http:/i, 'https:');

					} else {
						element.thumbnail = null;
					}	
					if ( typeof item.saleInfo.listPrice != 'undefined') {
						element.price = item.saleInfo.listPrice.amount;
					} else {
						element.price = null;
					}	
					if ( typeof item.saleInfo.buyLink != 'undefined') {
						element.purchase = item.saleInfo.buyLink;
					} else {
						element.price = null;
					}	
					if ( typeof item.volumeInfo.description != 'undefined') {
						element.description = item.volumeInfo.description;
					} else {
						element.description = null;
					}	
					this.setState(this.state.items.splice(i, 1, element));
				})				
		}).catch((err) => {
				console.error('There was an error fetching data', err);
			});
	}

	componentDidMount() {		
		// Populate the saved list
		axios.get('/api/saved')
		.then(response =>{
			console.log('Fetched from mongo', response.data);
			this.setState({
				saved: response.data
			})
		}).catch(err => {
			console.error(err);
		});

		// Offline
		if(!window.navigator.onLine) {
			setTimeout(function() {alert('You appear to be offline. Your saved books are still avaiable to you'); }, 1);
			// Open IDB
			const dbPromise = idb.open('saved', 1, upgradeDB => {
			// Create an object store named weather if none exists
			//eslint-disable-next-line	
			let saved = upgradeDB.createObjectStore('saved');
			}).catch(error => {
					console.error('IndexedDB:', error);
			});
			//Get all the saved books
			dbPromise.then(db => {
			return db.transaction('saved')
				.objectStore('saved').getAll();
			}).then(allObjs => {
				this.setState({
					saved: allObjs,
					visibility: {
					highlight: false,
					booklist: false,
					saved: true
					}
				});
			});
		}		
	}

	// componentWillUnmount() {
	// 	this.serverRequest.abort();
	// }

	// Set the current query in state on change
	updateQuery(queryObject) {
		this.setState({
			queryObject: {
				type: queryObject.type,
				query: queryObject.query
			},
			visibility: {
				highlight: false,
				booklist: true,
				saved: false
			}
		}, () => {
			this.fetchQuery();
		});
		
	}

	// Show all the data pertaining to an item
	updateHighlight(highlight) {
		this.setState({
			highlight: highlight.highlight,
			visibility: {
				highlight: true,
				booklist: true,
				saved: false
			}
		});
		
	}

	updateSavedHighlight(highlight) {
		this.setState({
			highlight: highlight.highlight,
			visibility: {
				highlight: true,
				booklist: false,
				saved: true
			}
		});
		

	}

	addSaved(data) {	
		// Add to state	
		this.setState({
			items: this.state.items.filter((item, i) => i !== this.state.highlight),
			visibility: {
				highlight: false,
				booklist: false,
				saved: true
			},
			saved: [ ...this.state.saved, data]
		});

		// Open IDB
		const dbPromise = idb.open('saved', 1, upgradeDB => {
			// Create an object store if none exists
			//eslint-disable-next-line	
			let saved = upgradeDB.createObjectStore('saved');
		}).catch(error => {
				console.error('IndexedDB:', error);
		});

		// Add saved to IDB
		dbPromise.then(db => {
			let tx = db.transaction('saved', 'readwrite');
			let saved= tx.objectStore('saved', 'readwrite');
			saved.add(data, data.title);
		}).catch(error => {
				console.error('IndexedDB:', error);
		});

		// Add saved to mongoDB
		axios.post('/api/saved', data)
		.then(function (res) {
		console.log(res);
		})
		.catch(function (err) {
			console.log(err);
		});  	
		
	}

	removeSaved(data) {
		const remove = this.state.saved;
		remove.splice(this.state.highlight, 1);
		this.setState({
			visibility: {
				highlight: false,
				booklist: false,
				saved: true
			},
			saved: [...remove]
		});
		const dbPromise = idb.open('saved', 1, upgradeDB => {
        // Create an object store named weather if none exists
		//eslint-disable-next-line	
		let saved = upgradeDB.createObjectStore('saved');
	    }).catch(error => {
	        console.error('IndexedDB:', error);
	    });
		dbPromise.then(db => {
            let tx = db.transaction('saved', 'readwrite');
            let saved= tx.objectStore('saved', 'readwrite');
            saved.delete(data.title);
        }).catch(error => {
            console.error('IndexedDB:', error);
        })
		
		axios.delete(`/api/saved/${data._id}`, data)
			.then(function(res){
				console.log(res);
			}).catch(function(err){
				console.error(err);
			})
	}
  
	// Set state for which parts of the UI are visible
	updateVisibility(setVisibility) {
		this.setState({
			visibility: {
				highlight: setVisibility.highlight,
				booklist: setVisibility.booklist,
				saved: setVisibility.saved
			}
		});

	}

 	render() {
		return(
			<div className="app">
				<DashBoard queryObject={this.updateQuery} />

				<Highlight data={this.state.visibility.saved ?
					this.state.saved[this.state.highlight] :
					this.state.items[this.state.highlight]}
						   visibility={this.state.visibility}
						   addSaved={this.addSaved}
						   removeSaved={this.removeSaved}/>

				<BookList data={this.state.items}
						  highlight={this.updateHighlight}
						  visibility={this.state.visibility.booklist} />
				
				<Saved data={this.state.saved}
						   highlight={this.updateSavedHighlight}
						   visibility={this.state.visibility.saved} />
				
				<Menu setVisibility={this.updateVisibility}
					  visibility={this.state.visibility} />
			</div>
		)
	}
};

export default App;
