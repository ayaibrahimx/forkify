import * as model from './model.js' 
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';


import 'core-js/stable';
import 'regenerator-runtime/runtime'

// if (module.hot){
//   module.hot.accept();
// }


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1);

    if(!id) return;
    //1 update bookmarks view
    recipeView.renderSpinner()

    //2 update results view to mark selected result
    resultsView.update(model.getSearchResultsPage());
    bookmarkView.render(model.state.bookmarks)
    
    // 3) Loading Recipe 
    await model.loadRecipe(id);

    // 4) Rendering Recipe 
    recipeView.render(model.state.recipe);

  } catch (err) {
    recipeView.renderError(); 
    console.error(err);
  }
};

controlRecipes();
['hashchange', 'load'].forEach(ev=> window.addEventListener(ev, controlRecipes));


const controlSearchResults = async function(){
  try {
    resultsView.renderSpinner();
    //1) Get Search Query
    const query = searchView.getQuery();
    if(!query) return;

    //2) Load Search Query
    await model.loadSeacrhResults(query)
    //3) Render Results
    // resultsView.render(model.state.search.results);
    console.log(model.getSearchResultsPage(1));
    resultsView.render(model.getSearchResultsPage());

    //render initial pagination buttons
    paginationView.render(model.state.search)
  } catch (err) {
    console.log(err)
  }
};
const controlPagination=function(goToPage){
  //1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));
   //render NEW pagination buttons
   paginationView.render(model.state.search)
  console.log(goToPage);
}
const controlServings=function(newServings){
  //Update the recipe servings (in state)
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}
const controlAddBookmark=function(){
  //add or remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id)

  //update recipe view
  recipeView.update(model.state.recipe)

  //render bookmarks
  bookmarkView.render(model.state.bookmarks);
}
const controlBookmarks=function(){
  bookmarkView.render(model.state.bookmarks)
}

const controlAddRecipe=async function(newRecipe){
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data
    await model.uploadRecipe(newRecipe)
  console.log(model.state.recipe);
    //Render recipe
    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    //Change ID in the URL
    window.history.pushState(null,'',`#${model.state.recipe.id}`)

    //close form window
    setTimeout(function(){
      addRecipeView.toggleWindow();
      location.reload();
    },MODAL_CLOSE_SEC*1000)
}
  catch(err){
    console.error('💥',err);
    addRecipeView.renderError(err.message)
  }
}

const init = function(){
  bookmarkView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
  
  
};


init();
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
