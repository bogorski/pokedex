document.addEventListener("DOMContentLoaded", () => {
	let pokemonsData = [];	
	let singlePokemon = {};
	const searchBtn = query("#searchButton");
	const input = query("#inputValue");
	const router = query(".router");
	let pokeId = null;
	let searchFrom = 0;
	const blackoutBlocker = query(".blackoutBlocker");

	class TextStyle {
		constructor(text) {
			this.text = text;
		}
		//big first capital
		firstCapital() {
			return this.text[0].toUpperCase() + this.text.substr(1);
		}
		//add # to the number, 00 for 1-9 and 0 for 10-99
		styleNumber() {
			if(this.text>=1&&this.text<=9){
				return '#00'+this.text;
			}else if(this.text>=10&&this.text<=99){
				return '#0'+this.text;
			}else{
				return '#'+this.text;
			}
		}
		
		styleWeight() {
			if((this.text.toString()).length==1){
				return "0."+(this.text.toString())[(this.text.toString()).length-1]+"kg"
			}else{
				return (this.text.toString()).substr(0, ((this.text.toString()).length-1))+"."+(this.text.toString())[(this.text.toString()).length-1]+"kg"
			}
		}
		styleHeight() {
			if((this.text.toString()).length==1){
				return "0."+(this.text.toString())[(this.text.toString()).length-1]+"m"
			}else{
				return (this.text.toString()).substr(0, ((this.text.toString()).length-1))+"."+(this.text.toString())[(this.text.toString()).length-1]+"m"
			}
		}
		styleGenus() {
			return this.text.substr(0, this.text.lastIndexOf("Pokémon"))
		}
	}

	const imgPokedex = query(".imgPokedex")
	imgPokedex.addEventListener("click", function(){
		clear();
		fLoader(router)
		search(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=0`, false)			
		history.pushState("0", null, "/pokedex/");		
	})
	
	function fLoader(where){
		this.where = where;

		const loader = create("div");
		loader.className = "loader";
		this.where.appendChild(loader);
		
		blackoutBlocker.className = "blackout";
	}
	
	function clear(){
		while (router.firstChild) {
			router.removeChild(router.firstChild); //lub div.firstChild.remove()
		}
		//clearList.remove();
		
		if(loadMoreResults){
			window.removeEventListener('scroll', loadMoreResults);
		}
		pokemonsData = [];
		searchFrom = 0;	
		blackoutBlocker.classList.remove("blackout");	
	}
	
	


	fLoader(router);
	
	//if()


	window.addEventListener("popstate", function(e) {
		
		clear();
		
		
		
   // alert("location: " + document.location + ", state: " + JSON.stringify(e.state));

		
		const lastHistory = history.state
		
		if(lastHistory==0){
			
			search(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=0`, false)
		
		}else{
			//console.log('last history wieksze od 0')
			singleData(lastHistory)
		}
		
		pokemonsData = [];
	
			
	});
	
	//sprawdza czy adres url jest standardowy (bogorski.pl/pokedex) czy kieruje do danego pokemona (bogorski.pl/pokedex/1 lub bogorski.pl/pokedex/bulbasaur)
	const nowUrl = location.href;
	const numberPokemon = nowUrl.substr(28);

	if(numberPokemon){
		singleData(numberPokemon);
		history.replaceState(numberPokemon, null, numberPokemon);
	}else{
		search(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=0`, false);
		history.replaceState("0", null, "/pokedex/");	
	}

	async function singleData(number){
		this.number = number;
		let urlSpecies = null;
		let urlEvolution = null;
		let urlAbilities = null;
		singlePokemon.abilities = [];
		singlePokemon.evolution = [];
		
		await fetch(`https://pokeapi.co/api/v2/pokemon/${this.number}`)
		.then(response => response.json())
		.then(data => { data
			urlAbilities = data.abilities;
			singlePokemon.forms = data.forms;
			singlePokemon.height = data.height;
			singlePokemon.id = data.id;
			singlePokemon.name = data.name;
			singlePokemon.src = data.sprites.other["official-artwork"].front_default;
			singlePokemon.stats = data.stats;
			singlePokemon.types = data.types;			
			singlePokemon.weight = data.weight;	
			urlSpecies =  data.species.url		
		})	
		.catch(error => {
			const loader = query(".loader")
			if(loader){
				loader.remove();
				blackoutBlocker.classList.remove("blackout");
			}
			
			if(query(".error")===null){
				const error = create("p")
				const inputSearch = query(".input-group")
				error.className = "rounded border border-3 p-1 error"
				inputSearch.appendChild(error)
				error.innerText = "Try again with a different search term";
				
				setTimeout(function deleteError(){
					if(query(".error")!==null){
						const error = query(".error")
						error.remove()
					}
				}	,3000);
				
			}
			history.replaceState('error', null, "/pokedex/error");
		});
		
		//clear()
		for(let i = 0; i<urlAbilities.length; i++){
			//only hidden abilities
			if(urlAbilities[i].is_hidden===false){
				await fetch(urlAbilities[i].ability.url)
				.then(response => response.json())
				.then(data => { data
					for(let j = 0; j<data.effect_entries.length; j++){
						if(data.effect_entries[j].language.name=="en"){
							singlePokemon.abilities.push({
														name: data.name,
														effect_entries: data.effect_entries[j].short_effect
							})						
						}
					}
				})	
				.catch(error => {
					const loader = query(".loader")
					if(loader){
						loader.remove();
						blackoutBlocker.classList.remove("blackout");
					}			
					if(query(".error")===null){
						const error = create("p")
						const inputSearch = query(".input-group")
						error.className = "rounded border border-3 p-1 error"
						inputSearch.appendChild(error)
						error.innerText = "Try again with a different search term";				
						setTimeout(function deleteError(){
							if(query(".error")!==null){
								const error = query(".error")
								error.remove()
							}
						}	,3000);			
					}
					history.replaceState('error', null, "/pokedex/error");
				});
			}	
		}
		
		await fetch(urlSpecies)
			.then(response => response.json())
			.then(data => { data
				urlEvolution = data.evolution_chain.url
				for(let i = 0; i<data.flavor_text_entries.length; i++){
					if(data.flavor_text_entries[i].language.name==="en"){
						singlePokemon.flavor_text = data.flavor_text_entries[i];
						//return 0;
					}
				}
				for(let i = 0; i<data.genera.length; i++){
					if(data.genera[i].language.name==="en"){
						singlePokemon.genus = data.genera[i].genus
						//return 0;
					}
				}
			})	
			.catch(error => {
				const loader = query(".loader")
				if(loader){
					loader.remove();
					blackoutBlocker.classList.remove("blackout");
				}			
				if(query(".error")===null){
					const error = create("p")
					const inputSearch = query(".input-group")
					error.className = "rounded border border-3 p-1 error"
					inputSearch.appendChild(error)
					error.innerText = "Try again with a different search term";				
					setTimeout(function deleteError(){
						if(query(".error")!==null){
							const error = query(".error")
							error.remove()
						}
					}	,3000);			
				}
				history.replaceState('error', null, "/pokedex/error");
			});
		await fetch(urlEvolution)
			.then(response => response.json())
			.then(data => { data	
				console.log(data)
				function pokemonEvolutionAlready(singlePokemonEvolution, dataTemp){
					this.singlePokemonEvolution = singlePokemonEvolution;
					this.dataTemp = dataTemp;
					this.singlePokemonEvolution.push({
														name: this.dataTemp.species.name, 
														url: this.dataTemp.species.url, 
														evolve: [], 
														id: singlePokemon.id,
														types: singlePokemon.types,
														src: singlePokemon.src
													})				
				}				
				async function apiEvolutionConnect(singlePokemonEvolution, dataTemp){
					console.log('before bbb')
					this.singlePokemonEvolution = singlePokemonEvolution;
					this.dataTemp = dataTemp;
					
						console.log(singlePokemon)
					await fetch(`https://pokeapi.co/api/v2/pokemon/${this.dataTemp.species.name}`)
					.then(response => response.json())
					.then(data => { data
				
						this.singlePokemonEvolution.push({
														name: this.dataTemp.species.name, 
														url: this.dataTemp.species.url, 
														evolve: [], //data.chain.evolves_to[0]
														id: data.id,
														types: data.types,	
														src: data.sprites.other["official-artwork"].front_default													
						})		
					})	
					.catch(error => {
						//alert("Nie istnieje taki pokemon");
						//clear()
						const loader = query(".loader")
						if(loader){
							loader.remove();
							blackoutBlocker.classList.remove("blackout");
						}
						
						if(query(".error")===null){
							const error = create("p")
							const inputSearch = query(".input-group")
							error.className = "rounded border border-3 p-1 error"
							inputSearch.appendChild(error)
							error.innerText = "Try again with a different search term";
							
							setTimeout(function deleteError(){
								if(query(".error")!==null){
									const error = query(".error")
									error.remove()
								}
							}	,3000);
							
						}
						history.replaceState('error', null, "/pokedex/error");
				
					});	
				}			
				async function evolutionView(){
					if(singlePokemon.name!==data.chain.species.name){
						await apiEvolutionConnect(singlePokemon.evolution, data.chain)
					}else{
						pokemonEvolutionAlready(singlePokemon.evolution, data.chain)
					}					
					let	temp = data.chain.evolves_to;
					let	singleTemp = singlePokemon.evolution[0].evolve;
					while(temp.length>0){
						if(temp.length==1){
							if(singlePokemon.name!==temp[0].species.name){
								await apiEvolutionConnect(singleTemp, temp[0])
							}else{
								pokemonEvolutionAlready(singleTemp, temp[0])
							}
							temp = temp[0].evolves_to
							singleTemp = singleTemp[0].evolve
						}else{
							for(let i = 0; i<temp.length; i++){
								if(singlePokemon.name!==temp[i].species.name){
									await apiEvolutionConnect(singleTemp, temp[i])										
									if(temp[i].evolves_to.length==1){
										if(singlePokemon.name!==temp[i].evolves_to[0].species.name){
											await apiEvolutionConnect(singlePokemon.evolution[0].evolve[i].evolve, data.chain.evolves_to[i].evolves_to[0])
										}else{
											console.log('zlozona ewolucja')
											pokemonEvolutionAlready(singlePokemon.evolution[0].evolve[i].evolve, data.chain.evolves_to[i].evolves_to[0])
										}
									}		
								}else{
									pokemonEvolutionAlready(singleTemp, temp[i])
									if(temp[i].evolves_to.length==1){
										console.log(singlePokemon.evolution[0].evolve[i].evolve)
										if(singlePokemon.name!==temp[i].evolves_to[0].species.name){
											await apiEvolutionConnect(singlePokemon.evolution[0].evolve[i].evolve, data.chain.evolves_to[i].evolves_to[0])
										}else{
											pokemonEvolutionAlready(singlePokemon.evolution[0].evolve[i].evolve, data.chain.evolves_to[i].evolves_to[0])
										}
									}
								}
							}
							return 0;
						}																					
					}
				}
				
				async function singlePokemonView(){			
					await evolutionView()
					singleTemplate(singlePokemon);	
					const loader = query(".loader")
					if(loader){
						loader.remove();
						blackoutBlocker.classList.remove("blackout");
					}
				}
				singlePokemonView()				
			})	
			.catch(error => {
				const loader = query(".loader")
				if(loader){
					loader.remove();
					blackoutBlocker.classList.remove("blackout");
				}			
				if(query(".error")===null){
					const error = create("p")
					const inputSearch = query(".input-group")
					error.className = "rounded border border-3 p-1 error"
					inputSearch.appendChild(error)
					error.innerText = "Try again with a different search term";				
					setTimeout(function deleteError(){
						if(query(".error")!==null){
							const error = query(".error")
							error.remove()
						}
					}	,3000);			
				}
				history.replaceState('error', null, "/pokedex/error");
			});			
	}
	
				
	function singleTemplate(object){
		this.object = object;
		
		//clear()
		const singleView = create("div");
		singleView.className = "mainDiv rounded";
		router.appendChild(singleView);
			
		//Navigaton and name
		const naviMain = create("div")
		singleView.appendChild(naviMain)	
		naviMain.className = "row text-center"
		
		const divNaviBack = create("div")
		naviMain.appendChild(divNaviBack)		
		divNaviBack.className = "col-3"
		const naviBackBtn = create("button")
		divNaviBack.appendChild(naviBackBtn)
		naviBackBtn.className = "btn btn-back"	
		naviBackBtn.addEventListener("click", backPokemon)
		function backPokemon(){
			console.log('BACK')
			if(singlePokemon.id==1){
				clear();
				fLoader(router);
				singleData(898)
				history.pushState(898, null, 898);
			}else{
				clear();
				fLoader(router);
				singleData(singlePokemon.id-1)
				history.pushState(singlePokemon.id-1, null, singlePokemon.id-1);
			}
		}
				
		const divNaviId = create("div")
		naviMain.appendChild(divNaviId)		
		divNaviId.className = "col-6"
		const pokemonNaviId = create("h1")
		divNaviId.appendChild(pokemonNaviId)
		pokemonNaviId.className = "display-4 fw-bold"
		pokemonNaviId.innerText = new TextStyle(this.object.id).styleNumber()
		
		const divNaviNext = create("div")
		naviMain.appendChild(divNaviNext)
		divNaviNext.className = "col-3"	
		const naviNextBtn = create("button")
		divNaviNext.appendChild(naviNextBtn)	
		naviNextBtn.className = "btn btn-next"	
		naviNextBtn.addEventListener("click", nextPokemon)
		function nextPokemon(){
			console.log('NEXT')
			if(singlePokemon.id==898){
				clear();
				fLoader(router);
				singleData(1)
				history.pushState(1, null, 1);
			}else{
				clear();
				fLoader(router);
				singleData(singlePokemon.id+1)
				history.pushState(singlePokemon.id+1, null, singlePokemon.id+1);
			}
		}
		
		const divNaviName = create("div")
		naviMain.appendChild(divNaviName)	
		divNaviName.className = "col-12"
		const pokemonNaviName = create("h1")
		divNaviName.appendChild(pokemonNaviName)
		pokemonNaviName.className = "display-1 fw-bold pb-4"
		pokemonNaviName.innerHTML = new TextStyle(this.object.name).firstCapital()
		
		//zmiana w zależności od wielkości okna
		var mobileViewport = window.matchMedia("screen and (max-width: 375px)");

		if(mobileViewport.matches) {
			naviNextBtn.innerText = ">"
			naviBackBtn.innerText = "<"
				
		}else{
			if(this.object.id==1){
				naviNextBtn.innerText = new TextStyle((this.object.id+1)).styleNumber() + " >"
				naviBackBtn.innerText = "< #898"
			}else if(this.object.id==898){
				naviNextBtn.innerText = "#001 >"
				naviBackBtn.innerText = "< " + new TextStyle((this.object.id-1)).styleNumber()
			}else{
				naviNextBtn.innerText = new TextStyle((this.object.id+1)).styleNumber() + " >"
				naviBackBtn.innerText = "< " + new TextStyle((this.object.id-1)).styleNumber()
			}
		}
		
		mobileViewport.addListener(function(mq) {
			if(mq.matches) {
				naviNextBtn.innerText = ">"
				naviBackBtn.innerText = "<"			
			} else {
				if(this.object.id==1){
					naviNextBtn.innerText = new TextStyle((this.object.id+1)).styleNumber() + " >"
					naviBackBtn.innerText = "< #898"
				}else if (this.object.id==898){
					naviNextBtn.innerText = "#001 >"
					naviBackBtn.innerText = "< " + new TextStyle((this.object.id-1)).styleNumber()
				}else{
					naviNextBtn.innerText = new TextStyle((this.object.id+1)).styleNumber() + " >"
					naviBackBtn.innerText = "< " + new TextStyle((this.object.id-1)).styleNumber()
				}
			}
		}.bind(this));
		
		//Pokemon details
		const pokemonDetailsMain = create("div")
		singleView.appendChild(pokemonDetailsMain)
		pokemonDetailsMain.className = "row p-3"
		
		const pokemonsStatsImage = create("div")			
		pokemonDetailsMain.appendChild(pokemonsStatsImage)
		pokemonsStatsImage.className = "col-12 col-lg-6"
		
		const pokemonData = create("div")			
		pokemonDetailsMain.appendChild(pokemonData)
		pokemonData.className = "col-12 col-lg-6"
		
		//Stats + image
		const imageStatsMain = create("div")
		pokemonsStatsImage.appendChild(imageStatsMain)
		imageStatsMain.className = "row p-3"
		
		//Image
		const divImagePokemon = create("div")			
		imageStatsMain.appendChild(divImagePokemon)
		divImagePokemon.className = "col-12 offset-md-2 col-md-8 offset-lg-0 col-lg-12 mb-3"
		
		const pokemonImage = create("img");
		divImagePokemon.appendChild(pokemonImage);
		pokemonImage.className = "img-fluid mx-auto d-block shadow";
		pokemonImage.src = this.object.src;
		pokemonImage.width = 375;
		pokemonImage.height = 375;
		
		//Stats	
		const divStatsMain = create("div")
		imageStatsMain.appendChild(divStatsMain)
		divStatsMain.className = "col-12 offset-md-2 col-md-8 offset-lg-0 col-lg-12"
		
		const divStats = create("div")
		divStatsMain.appendChild(divStats)
		divStats.className = "row text-center"
		
		
		const divStatsHeading = create("div")
		divStats.appendChild(divStatsHeading)
		divStatsHeading.className = "col-12"
		
		const statsText = create("h5")
		divStatsHeading.appendChild(statsText)
		statsText.className = "fw-bold p-2"
		statsText.innerText = "Stats"
		
		const divStatsRadar = create("div")
		divStats.appendChild(divStatsRadar)
		divStatsRadar.className = "col-12 canvas" 
		
		radarStats(	this.object.stats[0].base_stat,
					this.object.stats[1].base_stat,
					this.object.stats[2].base_stat,
					this.object.stats[3].base_stat,
					this.object.stats[4].base_stat,
					this.object.stats[5].base_stat)	

		
		
		//Data = Flavor text + abilities + type
		const divDataMain = create("div")
		pokemonData.appendChild(divDataMain)
		divDataMain.className = "row p-3"
		
		//Flavor text
		const divFlavorText = create("div")
		divDataMain.appendChild(divFlavorText)
		divFlavorText.className = "col-12 offset-md-2 col-md-8 offset-lg-0 col-lg-12"
		
		const flavorTextContent = create("p") 	
		divFlavorText.appendChild(flavorTextContent)
		flavorTextContent.innerText = this.object.flavor_text.flavor_text.replace(/[^a-z0-9s\.é]/gi, " ");
		
		
		//Abilities 
		const divAbilitiesMain = create("div")
		divDataMain.appendChild(divAbilitiesMain)
		divAbilitiesMain.className = "col-12 col-12 offset-md-2 col-md-8 offset-lg-0 col-lg-12 rounded abilities"
		
		const divAbilitiesMainRow = create("div")
		divAbilitiesMain.appendChild(divAbilitiesMainRow)
		divAbilitiesMainRow.className = "row text-center"
		
		const divAbilitiesLeft = create("div")
		divAbilitiesMainRow.appendChild(divAbilitiesLeft)
		divAbilitiesLeft.className = "col-6"
		
		const divAbilitiesLeftRow = create("div")
		divAbilitiesLeft.appendChild(divAbilitiesLeftRow)
		divAbilitiesLeftRow.className = "row"
			
		const divAbilities = create("div")
		divAbilitiesLeftRow.appendChild(divAbilities)
		divAbilities.className = "col-12 p-2"
		
		const divAbilitiesRow = create("div")
		divAbilities.appendChild(divAbilitiesRow)
		divAbilitiesRow.className = "row"
		
		const divAbilitiesText = create("div")
		divAbilitiesRow.appendChild(divAbilitiesText)
		divAbilitiesText.className = "col-12"
		
		const abilitiesText = create("h5")
		divAbilitiesText.appendChild(abilitiesText)
		abilitiesText.className = "fw-bold"
		abilitiesText.innerText = "Ablities"
				
console.log(singlePokemon)
		for(let i=0; i<this.object.abilities.length; i++){
			const divPopoverBtn = create("div")
			divAbilitiesRow.appendChild(divPopoverBtn)
			divPopoverBtn.className = "col-12"	
			const btnPopover = create("button")
			divPopoverBtn.appendChild(btnPopover)
			btnPopover.type = "button"
			btnPopover.className = "btn btn-popover w-100 h-100"
			btnPopover.innerText = this.object.abilities[i].name;
			new bootstrap.Popover(btnPopover, {
					trigger: 'focus',
					content: this.object.abilities[i].effect_entries,
					title: this.object.abilities[i].name
			})
		}
		
		const divGenusMain = create("div")
		divAbilitiesLeftRow.appendChild(divGenusMain)	
		divGenusMain.className = "col-12 p-2"
		
		const pokemonGenus = create("h5")
		divGenusMain.appendChild(pokemonGenus)
		pokemonGenus.className = "fw-bold"
		pokemonGenus.innerText = "Category"
		
		const pokemonGenusValue = create("p")
		divGenusMain.appendChild(pokemonGenusValue)
		pokemonGenusValue.innerText = new TextStyle(this.object.genus).styleGenus()
				
		const divAbilitiesRight = create("div")
		divAbilitiesMainRow.appendChild(divAbilitiesRight)
		divAbilitiesRight.className = "col-6"
	
		const divAbilitiesRightRow = create("div")
		divAbilitiesRight.appendChild(divAbilitiesRightRow)
		divAbilitiesRightRow.className = "row"
		
		const divPokemonWeight = create("div")
		divAbilitiesRightRow.appendChild(divPokemonWeight)
		divPokemonWeight.className = "col-12 p-2"
		
		const pokemonWeight = create("h5")
		divPokemonWeight.appendChild(pokemonWeight)
		pokemonWeight.className = "fw-bold"
		pokemonWeight.innerText = "Weight"
		
		const pokemonWeightValue = create("p")
		divPokemonWeight.appendChild(pokemonWeightValue)
		pokemonWeightValue.innerText = new TextStyle(this.object.weight).styleWeight()
		
		const divPokemonHeight = create("div")
		divAbilitiesRightRow.appendChild(divPokemonHeight)
		divPokemonHeight.className = "col-12 p-2"
		
		const pokemonHeight = create("h5")
		divPokemonHeight.appendChild(pokemonHeight)
		pokemonHeight.className = "fw-bold"
		pokemonHeight.innerText = "Height"
		
		const pokemonHeightValue = create("p")
		divPokemonHeight.appendChild(pokemonHeightValue)
		pokemonHeightValue.innerText = new TextStyle(this.object.height).styleHeight()

		//Type	
		const divTypeMain = create("div")
		divDataMain.appendChild(divTypeMain)
		divTypeMain.className = "col-12"
		
		const typeMain = create("div")
		divTypeMain.appendChild(typeMain)
		typeMain.className = "row p-3 text-center"
		
		const divTypeHeading = create("div")
		typeMain.appendChild(divTypeHeading)
		divTypeHeading.className = "col-12"
		
		const typeText = create("h3")
		divTypeHeading.appendChild(typeText)
		typeText.className = "fw-bold"
		typeText.innerText = "Type"
		
		const divTypeDetails = create("div")
		typeMain.appendChild(divTypeDetails)
		divTypeDetails.className = "col-12"
			
		const divType = create("div")
		divType.className = "row p-2"
		divTypeDetails.appendChild(divType)
		
		for(let i=0; i<this.object.types.length; i++){
			const listType = create("div");
			divType.appendChild(listType);
			listType.innerText = this.object.types[i].type.name
				if(this.object.types.length==1){
					listType.className = "offset-3 col-6 offset-sm-4 col-sm-4 border type";
				}else{
					if(i==0){
						listType.className = "offset-1 col-5 offset-sm-3 col-sm-3 border type";
					}else{
						listType.className = "col-5 col-sm-3 border type";
					}	
				}				
			listType.classList.add(listType.innerText);			
		}	

		//Evolution (img+name+number+type)
		
		const evolutionMain = create("div")
		singleView.appendChild(evolutionMain)
		evolutionMain.className = "row text-center p-2"
		
		const divEvolutionHeading = create("div")
		evolutionMain.appendChild(divEvolutionHeading)
		divEvolutionHeading.className = "col-12"
		
		const evolutionText = create("h1")
		divEvolutionHeading.appendChild(evolutionText)
		evolutionText.className = "display-1 fw-bold p-4"
		evolutionText.innerText = "Evolutions"

		const divEvolutionMaster = create("div")
		evolutionMain.appendChild(divEvolutionMaster)
		divEvolutionMaster.className = "col-12"
		const divEvolutionMasterRow = create("div")
		divEvolutionMaster.appendChild(divEvolutionMasterRow)
		divEvolutionMasterRow.className = "row align-items-center"
		
		function evolutionView(evolutionArr, columns=1, afterEvolution=false, appendObject=divEvolutionMasterRow){
			this.evolutionArr = evolutionArr;
			this.columns = columns;
			this.afterEvolution = afterEvolution
			this.appendObject = appendObject
			
			const classCol = "col-"+12/this.columns
			
			const divEvolutionMain = create("div")		
			this.appendObject.appendChild(divEvolutionMain);
			divEvolutionMain.className = classCol

			const divEvolution = create("div")		
			divEvolutionMain.appendChild(divEvolution)
			divEvolution.className = "row mb-5 align-items-center"
			if(this.afterEvolution){
				divEvolution.classList.add("nextEvolutionDesktop")
			}
						
			const divEvolutionImage = create("div")
			divEvolution.appendChild(divEvolutionImage)
			divEvolutionImage.className = "offset-2 col-8 offset-md-4 col-md-4 offset-lg-2 col-lg-8"
			
			const evolutionImage = create("img")
			divEvolutionImage.appendChild(evolutionImage)	
			evolutionImage.className="img-fluid circle"			
			evolutionImage.src = this.evolutionArr.src	
			evolutionImage.width = 375;
			evolutionImage.height = 375;	
			evolutionImage.id = this.evolutionArr.id			
			evolutionImage.addEventListener("click", function(){			
				history.pushState(evolutionImage.id, null, evolutionImage.id);
				clear();
				fLoader(router);
				singleData(evolutionImage.id)
			})		

			const divEvolutionId = create("div");
			divEvolution.appendChild(divEvolutionId)
			divEvolutionId.className = "col-12"
			
			const evolutionId = create("h5")
			divEvolutionId.appendChild(evolutionId)	
			evolutionId.innerText = new TextStyle(this.evolutionArr.id).styleNumber()
				
			const divEvolutionName = create("div");
			divEvolution.appendChild(divEvolutionName)
			divEvolutionName.className = "col-12"
			
			const evolutionName = create("h3")
			divEvolutionName.appendChild(evolutionName)			
			evolutionName.innerText = new TextStyle(this.evolutionArr.name).firstCapital();
				
			const divEvolutionTypeMain = create("div")	
			divEvolution.appendChild(divEvolutionTypeMain);
			divEvolutionTypeMain.className ="col-12"
			
			const divEvolutionType = create("div")		
			divEvolutionTypeMain.appendChild(divEvolutionType)
			divEvolutionType.className = "row"
				
			for(let i=0; i<this.evolutionArr.types.length; i++){
				const divType = create('div')
				if(this.evolutionArr.types.length==1){							
					divType.className = "offset-3 col-6 offset-md-4 col-md-4 border type"					
				}else{
					if(i==0){
						divType.className = "offset-3 col-6 offset-md-4 col-md-4 border type"
					}else{
						divType.className = "offset-3 col-6 offset-md-4 col-md-4 border type"
					}		
				}
				divEvolutionType.appendChild(divType)
				divType.innerText = this.evolutionArr.types[i].type.name
				divType.classList.add(this.evolutionArr.types[i].type.name);				
			}						
		}
			
		function nextEvolutionMobile(amountOfEvolution){
			this.amountOfEvolution=amountOfEvolution
			console.log('strzlka')
			const divCaretDown = create("div");
			divEvolutionMasterRow.appendChild(divCaretDown)
			divCaretDown.className= "col-"+(12/this.amountOfEvolution)+" fas fa-caret-down"
		}
		
		function pokemonEvolutionMobile(){
			evolutionView(this.object.evolution[0])			
			if(this.object.evolution[0].evolve.length==1){
				console.log("pierwsza ewolucja")
				nextEvolutionMobile(this.object.evolution[0].evolve.length)
				evolutionView(this.object.evolution[0].evolve[0])
				if(this.object.evolution[0].evolve[0].evolve.length==1){
					console.log("druga ewolucja")
					nextEvolutionMobile(this.object.evolution[0].evolve[0].evolve.length)
					evolutionView(this.object.evolution[0].evolve[0].evolve[0])
				}else if(this.object.evolution[0].evolve[0].evolve.length>1){
					console.log("druga ewolucja powyzej dwoch wariantow")
					for(let i=0; i<this.object.evolution[0].evolve[0].evolve.length; i++){
						nextEvolutionMobile(this.object.evolution[0].evolve[0].evolve.length)
					}
					for(let i=0; i<this.object.evolution[0].evolve[0].evolve.length; i++){	
						evolutionView(this.object.evolution[0].evolve[0].evolve[i], 2)
					}
				}
			}else if(this.object.evolution[0].evolve.length==8){
				console.log("pierwsza ewolucja z 8 EEVEE")
				nextEvolutionMobile(1)			
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){
					evolutionView(this.object.evolution[0].evolve[i],2)
				}
			}else if(this.object.evolution[0].evolve.length==3){
				console.log("pierwsza ewolucja z 3 warientów (Tyrogue)")
				nextEvolutionMobile(1)				
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){
					evolutionView(this.object.evolution[0].evolve[i],2)
				}		
			}else if(this.object.evolution[0].evolve.length>1){
				console.log("pierwsza ewolucja z więcej niż 2 (bez EEVEE)")
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){
					nextEvolutionMobile(this.object.evolution[0].evolve.length)
				}
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){	
					evolutionView(this.object.evolution[0].evolve[i], 2)
				}
				if(this.object.evolution[0].evolve[0].evolve.length>0){
					nextEvolutionMobile(2)
					nextEvolutionMobile(2)
				}
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){
					if(this.object.evolution[0].evolve[i].evolve.length>0){
						evolutionView(this.object.evolution[0].evolve[i].evolve[0], 2)
					}
				}				
			}	
		}
		
		function pokemonEvolutionDesktop(){
			//evolutionView(this.object.evolution[0],3)			
			if(this.object.evolution[0].evolve.length==1){
				console.log("pierwsza ewolucja")
				//evolutionView(this.object.evolution[0].evolve[0],3,true)
				if(this.object.evolution[0].evolve[0].evolve.length==0){
					evolutionView(this.object.evolution[0],2)		
					evolutionView(this.object.evolution[0].evolve[0],2,true)
				}else if(this.object.evolution[0].evolve[0].evolve.length==1){
					console.log("druga ewolucja")
					evolutionView(this.object.evolution[0],3)		
					evolutionView(this.object.evolution[0].evolve[0],3,true)
					evolutionView(this.object.evolution[0].evolve[0].evolve[0],3,true)
				}else if(this.object.evolution[0].evolve[0].evolve.length>1){
					console.log("druga ewolucja powyzej dwoch wariantow")
					evolutionView(this.object.evolution[0],3)		
					evolutionView(this.object.evolution[0].evolve[0],3,true)			
					const divCol = create("div")
					divEvolutionMasterRow.appendChild(divCol)
					divCol.className = "col-4"
					const divRow = create("div")
					divCol.appendChild(divRow)
					divRow.className = "row"
					for(let i=0; i<this.object.evolution[0].evolve[0].evolve.length; i++){					
						evolutionView(this.object.evolution[0].evolve[0].evolve[i], 1, true, divRow)
					}
				}
			}else if(this.object.evolution[0].evolve.length==8){
				console.log("pierwsza ewolucja z 8 EEVEE")
				evolutionView(this.object.evolution[0],3)	
				const divCol = create("div")
				divEvolutionMasterRow.appendChild(divCol)
				divCol.className = "col-8"
				const divRow = create("div")
				divCol.appendChild(divRow)
				divRow.className = "row nextEvolutionDesktop nextEvolutionDesktopEevee"						
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){
					evolutionView(this.object.evolution[0].evolve[i],2, false, divRow)
				}
			}else if(this.object.evolution[0].evolve.length==3){
				console.log("pierwsza ewolucja z 3 warientów (Tyrogue)")
				evolutionView(this.object.evolution[0],2)				
				const divCol = create("div")
				divEvolutionMasterRow.appendChild(divCol)
				divCol.className = "col-6"
				const divRow = create("div")
				divCol.appendChild(divRow)
				divRow.className = "row"
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){						
					evolutionView(this.object.evolution[0].evolve[i], 1, true, divRow)
				}		
			}else if(this.object.evolution[0].evolve.length>1){
				console.log("pierwsza ewolucja z więcej niż 2 (bez EEVEE)")
				evolutionView(this.object.evolution[0],3)					
				const divColFirst = create("div")
				divEvolutionMasterRow.appendChild(divColFirst)
				divColFirst.className = "col-4"
				const divRowFirst = create("div")
				divColFirst.appendChild(divRowFirst)
				divRowFirst.className = "row"							
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){	
					evolutionView(this.object.evolution[0].evolve[i], 1, true, divRowFirst)
				}
				const divColSecond = create("div")
				divEvolutionMasterRow.appendChild(divColSecond)
				divColSecond.className = "col-4"
				const divRowSecond = create("div")
				divColSecond.appendChild(divRowSecond)
				divRowSecond.className = "row"
				for(let i=0; i<this.object.evolution[0].evolve.length; i++){					
					evolutionView(this.object.evolution[0].evolve[i].evolve[0], 1, true, divRowSecond)					
				}				
			}	
		}
		
		//not evolve
		if(this.object.evolution[0].evolve.length==0){
			const divNoEvolution = create("div")
			divEvolutionHeading.appendChild(divNoEvolution)
			
			const noEvolution = create("p")
			divNoEvolution.appendChild(noEvolution)
			noEvolution.innerText = "This Pokémon does not evolve."	
			evolutionView(this.object.evolution[0])
		}else{
		//evolution			
			//zmiana w zależności od wielkości okna
			var mobileViewportEvolution = window.matchMedia("screen and (max-width: 1023px)");
		
			if(mobileViewportEvolution.matches) {
				console.log('obraz poniżej 1023px')
				pokemonEvolutionMobile()
			}else{
				console.log('obraz powyżej 1023px')
				pokemonEvolutionDesktop()				
			}
			
			mobileViewportEvolution.addListener(function(mq) {
				console.log(divEvolutionMasterRow)
				while (divEvolutionMasterRow.firstChild) {
					divEvolutionMasterRow.removeChild(divEvolutionMasterRow.firstChild);
				}
				console.log(divEvolutionMasterRow)		
				if(mq.matches) {			
					console.log('obraz poniżej 1024px')	
					pokemonEvolutionMobile()
				} else {
					console.log('obraz powyżej 1024px')
					pokemonEvolutionDesktop()
				}
			});			
		}		
	}
	///////////////////////////////////////////////
	searchBtn.addEventListener("click", function(){
		const inputSearch = query(".input-group")
		let value = input.value
		value = value.trim()
		if(value[0]=="#"||value[0]==0){
			value=value.substr(1)
			if(value[0]==0){
				value=value.substr(1)
				if(value[0]==0){
					value=value.substr(1)
				}
			}
		}
			
		function deleteError(){
			if(query(".error")!==null){
				const error = query(".error")
				error.remove()
			}
		}	
		
		value = value.toLowerCase();
		const reg = /^[a-z0-9-]{1,25}$/;
		const regNumber =  /^[0-9]{1,3}$/;
		const regLetter = /^[a-z-]{3,25}$/;
		
		if(value.length && reg.test(value) && ((regNumber.test(value)&&(value>=1 && value<=898)) || regLetter.test(value))){
			//console.log("OK wyszukuje")
			if(query(".error")){
				const error = query(".error")
				error.remove();
			}
			console.log('search')
			singleData(value);
			history.pushState(value, null, value);
			input.value = "";
			clear();
			fLoader(router);
		}else {
			//console.log("error2")
			if(query(".error")===null){
				const error = create("p")
				error.className = "rounded border border-3 p-1 error"
				inputSearch.appendChild(error)
				error.innerText = "Try again with a different search term";
				
				setTimeout(function deleteError(){
					if(query(".error")!==null){
						const error = query(".error")
						error.remove()
					}
				}	,3000);
				
			}
			input.value = ""
		}
	})

	function create(el){
		return document.createElement(el);
	}

	function query(el){
		return document.querySelector(el);
	}
	

	//łączenie z API
	async function search(url, isNext){
		this.isNext = isNext;
		await fetch(url)
		.then(response => response.json())
		.then(data => { data
			pokeList = data
		})	
		.catch(error => {
			data = null;
			
			const router = query(".router");
			const divError = create("div");
			divError.className = "row"
			div.appendChild(divError);
			divError.innerText = "Nie ma takiego pokemona";
		});
			for (let i = 0; i < pokeList.results.length; i++) {			
				await fetch(pokeList.results[i].url)
				.then(response => response.json())			
				.then(data =>{ data
					pokemonsData.push({
						name: data.name,
						id: data.id,
						types: data.types,
						//src: data.sprites.front_default
						//src: data.sprites.other.dream_world.front_default
						src: data.sprites.other["official-artwork"].front_default
					})
					//console.log(data.sprites.other["official-artwork"].front_default)

				//	console.log(data)
			//	console.log(pokemonsData)
				})				
				.catch(error => console.log("Błąd: ", error));
			} 	
		let mainDiv = null;	
		if(isNext){
			mainDiv = query(".mainDiv")
			list = query(".mainDiv")					
		}else{
			//console.log('ghj')
			mainDiv = create("div");
			//row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4
			mainDiv.className = "mainDiv row rounded mb-3 text-center"
			const router = query(".router");
			router.appendChild(mainDiv);
			//const list = create("div");
			//list.className = "list row text-center";
			//mainDiv.appendChild(list)
			
			function selectPokemon(event){
				console.log()
				if(event.target.closest(".card")){
					clear();
					fLoader(router)
					//console.log('click img')
					//widok pojedynczego pokemona			
					singleData(event.target.closest(".card").id)
					//dodanie histori
					history.pushState(event.target.closest(".card").id, null, event.target.closest(".card").id);
					router.removeEventListener("click", selectPokemon)
					window.removeEventListener('scroll', loadMoreResults)				
				}
				
			}	
			
			router.addEventListener("click", selectPokemon)		
			//list.removeEventListener("click", selectPokemon)
		}

		for(let i=searchFrom; i<pokemonsData.length; i++){
			//console.log(i)			
			const card = create("div");
			card.className = "card shadow h-100";
		
			card.id = pokemonsData[i].name;
		//	console.log(list)
			const list = query(".mainDiv")
			
			
			
		
			 
			const listElement = create("div");
			listElement.className = "col-12 col-sm-6 col-lg-4 col-xl-3 pt-3";
			list.appendChild(listElement);
			
			listElement.appendChild(card)
			
			//const nextDiv = create("div");
			
			//nextDiv.className="circle col-8"
			const divImg = create("div")
			const img = create("img");
			img.className = "card-img-top img-fluid p-3";
			img.src = pokemonsData[i].src;
			img.width = 375;
			img.height = 375;
			img.alt = "Image " + pokemonsData[i].name
			
			//listElement.appendChild(divImg);
			card.appendChild(img);
			const cardBody = create("div")
			cardBody.className = "card-body"
			card.appendChild(cardBody)
			

			const divNumber = create("div");
			const number = create("p");
			divNumber.className = "col-12";
			const divName = create("div");
			const pokemonName = create("p");
			pokemonName.className = "name"
			number.className = "number"
			divName.className = "col-12"
		
			cardBody.appendChild(divNumber);
			divNumber.appendChild(number);
			cardBody.appendChild(divName);
			divName.appendChild(pokemonName);
		
			number.innerText = new TextStyle(pokemonsData[i].id).styleNumber()
			
			pokemonName.innerText = new TextStyle(pokemonsData[i].name).firstCapital();
			
			const div22 = create("div");
			div22.className = "row"
			cardBody.appendChild(div22);
			
			for(let j=0; j<pokemonsData[i].types.length; j++){
				const listTypes = create("p");
				
				div22.appendChild(listTypes);
				listTypes.innerText = pokemonsData[i].types[j].type.name
					
				if(pokemonsData[i].types.length==1){
					
				listTypes.className = "col-4 border offset-4 type ";	
				}else{
					if(j==0){
						
					listTypes.className = "col-4 offset-2 border type ";
					}else{
						
						listTypes.className = "col-4 border type ";
					}
				}
				listTypes.classList.add(listTypes.innerText);
			}
					
		}
				
		if(searchFrom==0){
			//const moreResults = create("div");
			//moreResults.className = "moreResults col-12";
			//mainDiv.appendChild(moreResults);
			
			const buttonMoreResults = create("button");
			mainDiv.appendChild(buttonMoreResults)
			//moreResults.appendChild(buttonMoreResults);
			buttonMoreResults.className = "buttonMoreResults btn col-12 col-sm-6 offset-sm-3 col-lg-4 offset-lg-4 my-3";
			buttonMoreResults.innerText = "Więcej";
		
			buttonMoreResults.addEventListener("click", function(){

				buttonMoreResults.remove();
				
				fLoader(router);
			
				searchFrom += 12;
					
					search(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${searchFrom}`, true)
	
			})
		}
		
		window.addEventListener('scroll', loadMoreResults)

		

		const loader = query(".loader")
		if(loader){
			loader.remove();
			blackoutBlocker.classList.remove("blackout");
		}
	}

	function loadMoreResults(){
			const scrollTop = document.documentElement.scrollTop;
			const scrollHeight = document.documentElement.scrollHeight;
			// (document.documentElement.clientHeight)	+	(document.documentElement.scrollTop)!==(document.documentElement.scrollHeight) źle liczy dla mobilnych
			// (window.innerHeight)						+	(document.documentElement.scrollTop)!==(document.documentElement.scrollHeight) dobrze liczy na mobilnych
			const clientHeight = window.innerHeight
			//const clientHeight = document.documentElement.clientHeight;
				
			if(scrollTop + clientHeight > scrollHeight - 15){
				
				const loaderDiv = query(".loader");
				const btnMoreResults = query(".buttonMoreResults")
				
				if(!loaderDiv && !btnMoreResults){
					if(searchFrom<875){
						fLoader(router);
					searchFrom += 12;
						search(`https://pokeapi.co/api/v2/pokemon?limit=12&offset=${searchFrom}`, true)
					}
					 else if(searchFrom==876){
						searchFrom += 12;
						search(`https://pokeapi.co/api/v2/pokemon?limit=10&offset=${searchFrom}`, true)
					}
				}
			}
	}
console.log(singlePokemon.evolution)
})