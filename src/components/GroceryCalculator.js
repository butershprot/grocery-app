"use client"; // Важно для хуков useState, useEffect!

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { db } from "@/firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";

export default function GroceryCalculator() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", plannedQty: "", plannedCost: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "grocery"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.plannedQty || !newProduct.plannedCost) return;
    await addDoc(collection(db, "grocery"), {
      name: newProduct.name,
      plannedQty: parseFloat(newProduct.plannedQty),
      plannedCost: parseFloat(newProduct.plannedCost),
      boughtQty: 0,
      spentCost: 0
    });
    setNewProduct({ name: "", plannedQty: "", plannedCost: "" });
  };

  const updateProduct = async (id, field, value) => {
    await updateDoc(doc(db, "grocery", id), { [field]: parseFloat(value) || 0 });
  };

  const renameProduct = async (id, value) => {
    await updateDoc(doc(db, "grocery", id), { name: value });
    setEditingProduct(null);
  };

  const confirmDelete = (id, name) => {
    setShowConfirm({ id, name });
  };

  const deleteProduct = async () => {
    if (showConfirm) {
      await deleteDoc(doc(db, "grocery", showConfirm.id));
      setShowConfirm(null);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <Card className="bg-white shadow-md rounded-lg p-6">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Калькулятор продуктовой корзины</h2>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Продукт" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <Input placeholder="Количество (кг)" type="number" value={newProduct.plannedQty} onChange={e => setNewProduct({ ...newProduct, plannedQty: e.target.value })} />
            <Input placeholder="Стоимость (лари)" type="number" value={newProduct.plannedCost} onChange={e => setNewProduct({ ...newProduct, plannedCost: e.target.value })} />
            <Button onClick={addProduct}>Добавить</Button>
          </div>

          <Table className="w-full border-collapse border border-gray-300">
            <TableHeader className="bg-gray-200">
              <TableRow>
                <TableHead>Продукт</TableHead>
                <TableHead>Нужно (кг)</TableHead>
                <TableHead>Куплено (кг)</TableHead>
                <TableHead>Плановая стоимость</TableHead>
                <TableHead>Потрачено</TableHead>
                <TableHead>Осталось (кг)</TableHead>
                <TableHead>Осталось (деньги)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id} className="hover:bg-gray-100 transition">
                  <TableCell className="p-2 border border-gray-300 relative">
                    {editingProduct === product.id ? (
                      <Input
                        autoFocus
                        value={product.name}
                        onChange={e => renameProduct(product.id, e.target.value)}
                        onBlur={() => setEditingProduct(null)}
                      />
                    ) : (
                      <span onClick={() => setEditingProduct(product.id)} className="cursor-pointer hover:underline">
                        {product.name}
                      </span>
                    )}
                    <button onClick={() => confirmDelete(product.id, product.name)} className="absolute right-1 top-1 text-red-500 text-xs">✖</button>
                  </TableCell>
                  <TableCell className="p-2 border border-gray-300">{product.plannedQty} кг</TableCell>
                  <TableCell className="p-2 border border-gray-300">
                    <Input type="number" value={product.boughtQty} onChange={e => updateProduct(product.id, "boughtQty", e.target.value)} />
                  </TableCell>
                  <TableCell className="p-2 border border-gray-300">{product.plannedCost} лари</TableCell>
                  <TableCell className="p-2 border border-gray-300">
                    <Input type="number" value={product.spentCost} onChange={e => updateProduct(product.id, "spentCost", e.target.value)} />
                  </TableCell>
                  <TableCell className="p-2 border border-gray-300">{(product.plannedQty - product.boughtQty).toFixed(2)} кг</TableCell>
                  <TableCell className="p-2 border border-gray-300">{(product.plannedCost - product.spentCost).toFixed(2)} лари</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <p>Хотите удалить всю строку для "{showConfirm.name}"?</p>
            <div className="mt-4 flex justify-center gap-4">
              <Button onClick={deleteProduct} className="bg-red-500 text-white px-4 py-2 rounded">Да</Button>
              <Button onClick={() => setShowConfirm(null)} className="bg-gray-300 px-4 py-2 rounded">Нет</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
