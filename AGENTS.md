# Editable DataTables Demo Instructions

Application files are `index.php` and `jquery.dataTables.editableTable.js`; `data-tables/`, `jquery-ui/`, and `assets/` are vendored/demo trees. The root has no package manifest; `data-tables/package.json` belongs to that vendored component and does not provide an application workflow.

PHP is required for a bounded browser check: `php -S 127.0.0.1:<port> -t .`. `new.php`, `edit.php`, and `update.php` are empty, so do not describe the demo as persisted CRUD. Completion for an intended UI change is an inspected editable-table interaction without mass-editing vendored files.
