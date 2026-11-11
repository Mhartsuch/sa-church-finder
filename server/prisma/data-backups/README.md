# Data backups

Rows removed from production by data-repair migrations, kept so a removal can
be reversed by hand if a row turns out to have been real.

| File                                 | Migration                           | Contents                                                                                |
| ------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------- |
| `20261111-removed-service-rows.json` | `20261111000100_repair_church_data` | The 835 auto-imported `church_services` rows deleted as office hours / import artifacts |
