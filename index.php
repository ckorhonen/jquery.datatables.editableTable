<!DOCTYPE html>

<head>

    <link rel="stylesheet" type="text/css" href="data-tables/media/css/jquery.dataTables.css" />
    <link rel="stylesheet" type="text/css" href="assets/plugins/select2/select2_metro.css" />
    <link rel="stylesheet" type="text/css" href="jquery-ui/css/ui-lightness/jquery-ui-1.10.3.custom.min.css" />

</head>

<body>
    <button id="add-new">Add new</button>
    <table id="my-table">
        <thead>
            <tr>
                <th>Id</th>
                <th>Entity type</th>
                <th>Amount</th>
                <th>Date made</th>
                <th>Bank</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>Bank</td>
                <td>255</td>
                <td>2013/08/21</td>
                <td>Zagrebacka</td>
                <td><button class="edit">Edit</button></td>
                <td>
                    <button class="delete">Delete</button>
                    <input type="hidden" class="entity_type" value="2"/>
                    <input type="hidden" class="bank_id" value="3"/>
                </td>
            </tr>

        </tbody>
        <tfoot>
            <tr>
                <th>Id</th>
                <th>Entity type</th>
                <th>Amount</th>
                <th>Date made</th>
                <th>Bank</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
        </tfoot> 
    </table>


    <script src="assets/plugins/jquery-1.10.1.min.js" type="text/javascript"></script>
    <script src="assets/plugins/jquery-ui/jquery-ui-1.10.1.custom.min.js" type="text/javascript"></script>      

    <script type="text/javascript" src="assets/plugins/select2/select2.min.js"></script>
    <script type="text/javascript" src="assets/plugins/data-tables/jquery.dataTables.js"></script>

    <script type="text/javascript" src="jquery.dataTables.editableTable.js"></script>


    <script>
        var entity_types = {
            '1' : 'Suppliers',
            '2' : 'Banks'
        };
        
        var banks = {
            '1' : 'Zagrebacka',
            '2' : 'PBZ',
            '3' : 'Privredna'
        };
        
        //example usage
        $('#my-table').dataTable({
            
        }).editableTable({
            editElementClass : 'edit',
            deleteElementClass : 'delete',
            newButtonId : 'add-new',
            
            editUrl : 'edit.php',
            updateUrl : 'update.php',
            deleteUrl : 'delete.php',
            
            aoColumns: [
                {
                    editable : false
                },
                {
                    type : 'select',
                    data : entity_types,
                    serverName : 'entity_type'
                },
                {
                    type : 'text',
                    serverName : 'amount'
                },
                {
                    type : 'datepicker',
                    serverName : 'issue_date'
                },
                {
                    type : 'autocomplete',
                    data : banks,
                    serverName : 'bank_id'
                }
                
            ]
        });
    </script>
</body>
</html>