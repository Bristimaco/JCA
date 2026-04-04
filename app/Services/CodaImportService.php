<?php

namespace App\Services;

use Codelicious\Coda\Parser;

class CodaImportService
{
    public function parse(string $filePath, string $filename): array
    {
        $parser = new Parser;
        $statements = $parser->parseFile($filePath);

        $transactions = [];

        foreach ($statements as $statement) {
            $account = $statement->getAccount();

            foreach ($statement->getTransactions() as $transaction) {
                $counterparty = $transaction->getAccount();

                $transactions[] = [
                    'account_number' => $account->getNumber(),
                    'account_name' => $account->getName(),
                    'transaction_date' => $transaction->getTransactionDate()->format('Y-m-d'),
                    'valuta_date' => $transaction->getValutaDate()->format('Y-m-d'),
                    'amount' => $transaction->getAmount(),
                    'counterparty_name' => $counterparty->getName() ?: null,
                    'counterparty_account' => $counterparty->getNumber() ?: null,
                    'message' => $transaction->getMessage() ?: null,
                    'structured_message' => $transaction->getStructuredMessage() ?: null,
                    'statement_sequence' => $transaction->getStatementSequence(),
                    'transaction_sequence' => $transaction->getTransactionSequence(),
                    'coda_filename' => $filename,
                ];
            }
        }

        return $transactions;
    }
}
