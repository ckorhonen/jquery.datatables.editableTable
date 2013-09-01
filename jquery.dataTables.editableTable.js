/*
* File:        jquery.dataTables.editableTable.js
* Version:     0.9
* Author:      Denis Nizetic
*
* Copyright 2013 Denis Nizetic, all rights reserved.
*
* This source file is free software, under either the GPL v2 license or a
* BSD style license, as supplied with this software.
*
* This source file is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
* or FITNESS FOR A PARTICULAR PURPOSE.
*
*/

/*
 *  //Full usage example
 *  $('#my-table').dataTable({
 *  
 *  }).editableTable(
 *      {
 *              columns: [
 *              {
 *                  editable : false
 *              },
 *              {
 *                  type : 'select',
 *                  data : entity_types, //id : value pairs
 *                  serverName : 'entity_type'
 *              },
 *              {
 *                  type : 'text',
 *                  serverName : 'check_number'
 *              },
 *              {
 *                  type : 'datepicker',
 *                  serverName : 'issue_date'
 *              },
 *              editElementClass : '',
 *              deleteElementClass : '',
 *              newElementId : ''
 *             
 *              editUrl : '',
 *              newUrl : '',
 *              deleteUrl : ''
 *          ]
 *      }
 *  )
 *
 */


(function ($) {


    $.fn.editableTable = function (options)
    {

        var tableId = $(this).attr('id');
        var editElementClass = options['editElementClass'];
        var newElementId = options['newElementId'];
        var deleteElementClass = options['deleteElementClass'];
        
        var oTable = $(this).dataTable();
        
        var editUrl = options['editUrl'];
        var newUrl = options['newUrl'];
        var deleteUrl = options['deleteUrl'];
        
        var columns = options['aoColumns'];
        
        //edit/delete actions require a primary key
        
        //@todo: payment_id literal
        
        
        /*
             * @author Denis Nizetic
             * @param optionsObject object - javascript object with id : value pairs
             * @param attributes string optional - attributes of generated select element
             * @return string - generated select HTML
             */
        function generateSelectHtml(optionsObject, attributes)
        {
            var selectHtml = (attributes === undefined) ? '<select>':
            ('<select ' + attributes + '>');

            for(var key in optionsObject) {
                selectHtml += "<option value=" + key  + ">" +optionsObject[key] + "</option>"
            }

            selectHtml += "</select>";

            return selectHtml;
        }

        /*
             * @author Denis Nizetic
             * @param td TD jQuery element
             * @return jQueryElement - corresponding header TH element
             */
        function getCellHeader(td)
        {
            return td.closest('table').find('th').eq(td.index());
        }

        /*
             * @author Denis Nizetic
             * @param obj javascript object
             * @return array - values of all properties as array
             */
        function getObjectPropertiesValues(obj)
        {
            var dataArray = [];
            for(var propt in obj)
                dataArray.push(obj[propt]);

            return dataArray;
        }


        /*
             * @param string
             * @return string - string with first letter capitalised
             * @link http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
             */
        function capitaliseFirstLetter(string)
        {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }


        /*
             * @param obj javascript object
             * @param index property index place
             * @return mixed - value of object's property at index
             * @link http://stackoverflow.com/questions/983267/access-the-first-property-of-an-object
             */
        function getObjectPropertyValueAtIndex(obj, index)
        {
            return obj[Object.keys(obj)[index]];
        }

        /*
             * @param obj javascript object
             * @param index property index value
             * @return mixed - object property name
             * @link http://stackoverflow.com/questions/983267/access-the-first-property-of-an-object
             */
        function getObjectPropertyKeyAtIndex(obj, index)
        {
            return Object.keys(obj)[index];
        }

        function restoreRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);

            var oldValues = getObjectPropertiesValues(aData);

            var jqTds = $('>td', nRow);

            for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                oTable.fnUpdate(oldValues[i], nRow, i, false);
            }

            oTable.fnDraw();
        }
        
        
        function editRowRevised(oTable, nRow)
        {
            var aData = oTable.fnGetData(nRow);
            
            var jqTds = $('>td', nRow);
            var length = aData.length;
            
            for (var i = 0; i < (length - 2); i++)
            {
                if(columns[i] === undefined)
                    break;
                var columnOptions = columns[i];
                
                if(columnOptions.editable === false)
                    continue;
                
                var tdElement = $(jqTds[i]);
                var parentWidth = tdElement.width();
                
                var type = columnOptions.type;
                if(type === 'select')
                {
                    var data = columnOptions.data;
                    jqTds[i].innerHTML = generateSelectHtml(data, 'style="width: ' 
                        + parentWidth + 'px"');

                    var currentValue = $('.' + columnOptions.serverName).val();
                    var selectElement = tdElement.find('select');

                    //add empty option
                    //@todo make this an option
                    //selectElement.prepend('<option></option>');
                    selectElement.val(currentValue);
                    //selectElement.select2({
                    //});
                    
                    selectElement.change({ serverName : columnOptions.serverName }, function(e) {
                        $('.' + e.data.serverName).val($(this).val());
                    }); 
                    
                }
                else if(type === 'text'
                    || type === 'datepicker'
                    || type === 'autocomplete')
                    {
                    jqTds[i].innerHTML = '<input style="width:' 
                    + parentWidth + 'px" type="text" value="' 
                    + aData[i] + '">';
                    
                    var inputElement = tdElement.find('input');
                    if(type === 'datepicker')
                    {
                        inputElement.datepicker({
                            dateFormat: 'yy/mm/dd'
                        });
                    }
                    else if(type === 'autocomplete')
                    {
                        
                        var autocompleteData = columnOptions.data;
                        var formatedAutocompleteData = new Array();
                        length = autocompleteData.length;
                        for(var propt in autocompleteData)
                            formatedAutocompleteData.push(
                                {
                                    id : propt,
                                    value : autocompleteData[propt]
                                }
                                
                            );
                        console.log(formatedAutocompleteData);
                            
                        function format(item) {
                            return item.value;
                        };
                        inputElement.select2({
                            allowClear: true,
                            data: {
                                results: formatedAutocompleteData, 
                                text: 'value'
                            },
                            formatSelection: format,
                            formatResult: format
                        });
                            
                        inputElement.on("select2-selecting", null, { serverName : columnOptions.serverName }, function(e) {
                            $('.' + e.data.serverName).val(e.val);
                            
                        });
                            
                        tdElement.find('.select2-chosen').text(aData[i]);
                    }
                }
            }
            
            $(jqTds[length - 2]).find('.' + editElementClass).text('Save');
            var deleteElement = $(jqTds[length - 1]).find('.' + deleteElementClass);
            deleteElement.attr('class', 'cancel');
            deleteElement.text('Cancel');
        }
        

        function saveRow(oTable, nRow) {

            var jqTds = $('>td', nRow);
            $.each(jqTds, function(index, value) {
                var element = $(this);

                var headerTitle = getCellHeader(element).attr('title');
                var updateText;

                if(headerTitle === 'autocomplete'
                    || headerTitle === 'autocomplete_dependant')
                    {

                    updateText = element.find('.select2-chosen').text();
                }
                else
                {
                    var childElement = element.children().first();

                    //select2 (plugin)
                    if(childElement.is('div') && childElement.attr('id').indexOf('s2id') != -1)
                    {
                        //updateText = childElement.find('option:selected').text();
                        updateText = childElement.find('.select2-chosen').text();
                    }
                    //input
                    else if(childElement.is('input'))
                    {
                        updateText = childElement.val();
                    }
                }

                if(updateText !== undefined)
                    oTable.fnUpdate(updateText, nRow, index, false);
            });

            $('a.edit', nRow).replaceWith('<a class="edit" href="">Edit</a>');
            $('a.cancel', nRow).replaceWith('<a class="delete" href="">Delete</a>');

            oTable.fnDraw();

            //ajax: determine whether this is a new or existing entity
            //assemble key value pairs to be updated
            var aData = oTable.fnGetData(nRow);
            //vision: clientFields + serverFields (server fields are sent, client fields arent)
            //this is specified in an attribute (side="client")

            //get a list of "client side" columns, which arent persisted to server


            //find out which elements in aData are persisted

            var row = $(nRow);
            var newValuesRevised = { };

            var clientServerFields = mainObject.clientServer;
            var length = clientServerFields.length;
            for(var i = 0; i < length; i++)
            {
                var field = (clientServerFields[i] instanceof Object ?
                    clientServerFields[i].name : clientServerFields[i]);
                newValuesRevised[field] = aData[field];
            }

            var serverFields = mainObject.server;
            length = serverFields.length;
            for(i = 0; i < length; i++)
            {
                field = (serverFields[i] instanceof Object ?
                    serverFields[i].name : serverFields[i]);
                newValuesRevised[field] = row.find("." + field).val();
            }

            var url;
            if(row.find('.payment_id').val() !== '')
            {
                url = updateUrl;
            }
            else
            {
                url = createUrl;
            }

            $.ajax({
                type:"POST",
                dataType: "json",
                url: BASE_JS + url,
                data: newValuesRevised,
                success: function(result)
                {

                }
            });
        }

        function cancelEditRow(oTable, nRow) {
            var jqInputs = $('input', nRow);

            var length = jqInputs.length;
            for (var i = 0; i < length; i++) {
                oTable.fnUpdate(jqInputs[i].value, nRow, i, false);
            }
            oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, length, false);
            oTable.fnDraw();
        }

        var nEditing = null;

        //perhaps provide a callback for Add new (in case you want to set default values, etc.)
        //Add New
        $('#' + newElementId).click(function (e) {
            //if already editing, don't create new
            if(nEditing !== null)
                return;

            e.preventDefault();

            //get client server & client fields
            var newObjectRevised = { };
            var allFields = mainObject.clientServer.concat(mainObject.client);
            var length = allFields.length;
            for(var i = 0; i < length; i++)
            {
                var field = (allFields[i] instanceof Object ?
                    allFields[i].name : allFields[i]);
                newObjectRevised[field] = (allFields[i] instanceof Object ?
                    allFields[i].defaultValue : '');
            }
            newObjectRevised['edit'] = "<a class='edit' href=''>Edit</a>";
            //generate hidden fields
            var hiddenFieldsString = '<a class="cancel" data-mode="new" href="">Cancel</a>';
            var serverFields = mainObject.server;
            length = serverFields.length;
            for(i = 0; i < length; i++)
            {
                var valueString = '';
                if(serverFields[i] instanceof Object)
                {
                    valueString = 'value="' + serverFields[i].defaultValue + '"';

                    hiddenFieldsString += '<input class="' + serverFields[i].name +
                    '" ' + valueString +  ' type="hidden" />';
                }
                else
                {
                    hiddenFieldsString += '<input class="' + serverFields[i] +
                    '" ' + ' type="hidden" />';
                }

            }
            newObjectRevised['delete_'] = hiddenFieldsString;

            var aiNew = oTable.fnAddData(newObjectRevised);

            var nRow = oTable.fnGetNodes(aiNew[0]);

            editRowRevised(oTable, nRow);
            nEditing = nRow;
        });

        $("#" + tableId).on('click', '.' + deleteElementClass,  function (e) {
            e.preventDefault();

            if (confirm("Are you sure to delete this row ?") == false) {
                return;
            }

            var nRow = $(this).parents('tr')[0];
            var id = $(nRow).find('.payment_id').val();
            var sendData = {
                payment_id : id
            };


            $.ajax({
                type:"POST",
                dataType: "json",
                url: BASE_JS + deleteUrl,
                data: sendData,
                async: false,
                success: function(result)
                {

                }
            });
            alert('Deleted');
            oTable.fnDeleteRow(nRow);
        //alert("Deleted! Do not forget to do some ajax to sync with backend :)");
        });

        $("#" + tableId).on('click', '.cancel', function (e) {
            e.preventDefault();

            if ($(this).attr("data-mode") == "new") {
                var nRow = $(this).parents('tr')[0];
                oTable.fnDeleteRow(nRow);
            } else {
                restoreRow(oTable, nEditing);
            //nEditing = null;
            }
            nEditing = null;
        }); 

        //edit
        $("#" + tableId).on('click', '.' + editElementClass, function (e) {
            e.preventDefault();

            /* Get the row as a parent of the link that was clicked on */
            var nRow = $(this).parents('tr')[0];

            if (nEditing !== null && nEditing != nRow) {
                /* Currently editing - but not this row - restore the old before continuing to edit mode */
                restoreRow(oTable, nEditing);
                editRowRevised(oTable, nRow);
                nEditing = nRow;
            } else if (nEditing == nRow && this.innerHTML == "Save") {
                /* Editing this row and want to save it */
                saveRow(oTable, nEditing);
                nEditing = null;
            //alert("Updated! Do not forget to do some ajax to sync with backend :)");
            } else {
                /* No edit in progress - let's start one */
                editRowRevised(oTable, nRow);
                nEditing = nRow;
            }
        });
    }



})(jQuery);