-- AlterTable
ALTER TABLE "solicitacoes" ADD COLUMN     "analisadoEm" TIMESTAMP(3),
ADD COLUMN     "analisadoPorIA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relatorioIA" TEXT;
