-- CreateTable
CREATE TABLE "work_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_log_entries" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "work_type_id" TEXT NOT NULL,
    "volume" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "executor_name" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_types_name_key" ON "work_types"("name");

-- CreateIndex
CREATE INDEX "work_log_entries_date_idx" ON "work_log_entries"("date");

-- CreateIndex
CREATE INDEX "work_log_entries_work_type_id_idx" ON "work_log_entries"("work_type_id");

-- AddForeignKey
ALTER TABLE "work_log_entries" ADD CONSTRAINT "work_log_entries_work_type_id_fkey" FOREIGN KEY ("work_type_id") REFERENCES "work_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
