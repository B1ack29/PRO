import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, Alert, RefreshControl
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getProducts, deleteProduct, Product } from '../utils/storage';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? '#4CAF50' : score >= 6 ? '#FF6B35' : score >= 4 ? '#FFC107' : '#F44336';
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{score.toFixed(1)}</Text>
    </View>
  );
}

function ProductCard({ item, onPress, onDelete }: {
  item: Product;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbEmoji}>📦</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.criteriaCount}>{item.criteria.length} criteria</Text>
      </View>
      <View style={styles.cardRight}>
        <ScoreBadge score={item.overallScore} />
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete product',
      `Remove "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
            loadProducts();
          },
        },
      ]
    );
  };

  const avgScore = products.length
    ? (products.reduce((s, p) => s + p.overallScore, 0) / products.length).toFixed(1)
    : '—';

  return (
    <View style={styles.container}>
      {products.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{products.length}</Text>
            <Text style={styles.statLabel}>PRODUCTS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{avgScore}</Text>
            <Text style={styles.statLabel}>AVG SCORE</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>
              {products.filter(p => p.overallScore >= 8).length}
            </Text>
            <Text style={styles.statLabel}>TOP RATED</Text>
          </View>
        </View>
      )}

      <FlatList
        data={products}
        keyExtractor={item => item.id}
        contentContainerStyle={products.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Tap ADD to rate your first product</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => router.push(`/product/${item.id}`)}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { color: '#FF6B35', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#555', fontSize: 10, letterSpacing: 1, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#1E1E1E' },
  list: { padding: 12, gap: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  emptyText: { color: '#555', fontSize: 14 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardLeft: {},
  thumbnail: { width: 72, height: 72 },
  thumbnailPlaceholder: {
    width: 72, height: 72,
    backgroundColor: '#1E1E1E',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 28 },
  cardBody: { flex: 1, paddingHorizontal: 12, gap: 3 },
  productName: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  productCategory: { color: '#FF6B35', fontSize: 11, letterSpacing: 1 },
  criteriaCount: { color: '#555', fontSize: 11 },
  cardRight: { paddingRight: 12, alignItems: 'center', gap: 10 },
  badge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8,
    minWidth: 48, alignItems: 'center',
  },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  deleteBtn: { padding: 4 },
  deleteText: { color: '#333', fontSize: 14 },
});
