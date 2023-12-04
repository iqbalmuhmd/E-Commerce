const loadDashboard = async(req,res) =>{
    try {
        res.render('admin/index')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadDashboard
}