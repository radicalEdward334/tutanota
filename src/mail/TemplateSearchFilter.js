//@flow


export function searchForID(input: string, list: any[]): Array<any> {
	let results = []
	let queryString = input.substring(1).trim().toLowerCase() // remove # and whitespaces at end from input
	let i
	for (i = 0; i < list.length; i++) {
		if (list[i].id !== null) {
			let tempID = list[i].id.toLowerCase()
			if (tempID.includes(queryString)) {
				results.push(list[i])
			}
		} else {
			console.log(list[i], "id is null")
		}
	}
	return results
}

export function searchInContent(input: string, list: any[]): Array<any>{
	let results = []
	let resultsContent = []
	let queryString = input.trim().toLowerCase()
	let i
	for (i = 0; i < list.length; i++) { // search first in title
		if (list[i].title !== null) {
			let tempTitle = list[i].title.toLowerCase()
			if (tempTitle.includes(queryString)) {
				results.push(list[i])
			}
		} else {
			console.log(list[i], "title is null?")
		}
	}
	return results.concat(resultsContent)
}
