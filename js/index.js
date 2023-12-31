
$("#add_user").submit(function(event){
    if(validateBasic()){
        alert("Data Inserted Successfully!");
    }
    
})

$("#update_user").submit(function(event){
    event.preventDefault();
    if (validateBasic1()) {
        var unindexed_array = $(this).serializeArray();
        var data = {}
        $.map(unindexed_array, function(n, i){
            data[n['name']] = n['value']
        })
        var request = {
            "url" : `http://127.0.0.1:3001/api/users/${data.id}`,
            "method" : "PUT",
            "data" : data
        }
        $.ajax(request).done(function(response){
            alert("Data Updated Successfully!");
        })
    }
});

if(window.location.pathname == "/index"){
    $ondelete = $(".table tbody td a.delete");
    $ondelete.click(function(){
        var id = $(this).attr("data-id")

        var request = {
            "url" : `http://127.0.0.1:3001/api/users/${id}`,
            "method" : "DELETE"
        }

        if(confirm("Do you really want to delete this record?")){
            $.ajax(request).done(function(response){
                alert("Data Deleted Successfully!");
                location.reload();
            })
        }

    })
}