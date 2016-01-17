/**
 * Created by lisa on 10/12/15.
 */

    // Prevent form submission
$("form").submit(function (event) {
    $("div").remove(".eexcess-isotope-grid-item");
    event.preventDefault();
    var input = $("#wiki-recommender-active-search").val();
    //console.log(input);

    $(getCommonsImages(input));

});