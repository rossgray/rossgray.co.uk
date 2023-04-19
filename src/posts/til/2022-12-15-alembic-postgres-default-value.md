---
title: Alembic migrations involving PostgreSQL column default values
date: 2022-12-15
tags: ["TIL", "Python", "PostgreSQL"]
---

_Today I Learnt_ how to create Alembic migrations when adding a new non-nullable column to an existing table

I wanted to create an Alembic migration for a new column in a Postgres table. The column should be non-nullable and needs a default value since there is already data in this table.

There are 2 ways to do this:

1. Create the column, allowing null values. Then update all rows to set a default. Then make the column non-nullable
2. Create the column with a default value

In Alembic, option 1 would look something like:

```python
def upgrade():
    # Add column, then set default value, then make non-nullable
    op.add_column("file", sa.Column("file_format", sa.String(), nullable=True))
    op.execute("UPDATE file SET file_format = 'hex' WHERE file_format is NULL")
    op.alter_column("file", "file_format", nullable=False)
```

whereas option 2 would look something like:

```python
def upgrade():
    op.add_column(
        "file",
        sa.Column("file_format", sa.String(), server_default="hex", nullable=False),
    )
```

Initially I decided to go for option 1 since I would like to update the default value in the future and I could do this without requiring another migration (I could just set `default` to another value).

However, as soon as I started running the migration I could see it was taking a long time to run, specifically the second `UPDATE` command. The table was not particularly large but had around 7 million rows and this command was taking over 5 minutes to run. Since this migration was running inside of a single transaction, it was also taking a lock on the table and thus impacting live traffic - thankfully I was just running this in the staging environment!

I did a bit of searching online and found (via [StackExchange](https://dba.stackexchange.com/a/211222)) the following [blog post](https://www.depesz.com/2018/04/04/waiting-for-postgresql-11-fast-alter-table-add-column-with-a-non-null-default/), which implies option 2 above should be a lot faster since PostgreSQL (as of version 11) does not need to rewrite the whole table when adding a new column with a default value. This is backed up by the official [PostgreSQL docs](https://www.postgresql.org/docs/15/sql-altertable.html) which under the ‘Notes’ section says:

> When a column is added with `ADD COLUMN` and a non-volatile `DEFAULT` is specified, the default is evaluated at the time of the statement and the result stored in the table's metadata. That value will be used for the column for all existing rows. If no `DEFAULT` is specified, NULL is used. In neither case is a rewrite of the table required.

I changed the migration to use `server_default` instead and reran the migration. It now took just 5 seconds!

(Note that versions of PostgreSQL prior to version 11 would lock the table even when using a default value due to it needing to rewrite the all data for the table on disk, so option 1 in this case would be better, although updating the rows in small batches is recommended to reduce downtime)

In summary, whenever adding a new non-nullable column to an existing table, always use `server_default` rather than populating it manually since PostgreSQL knows how to optimise for this.
